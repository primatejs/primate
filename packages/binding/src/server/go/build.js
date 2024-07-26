import ErrorInGoRoute from "@primate/binding/errors/error-in-go-route";
import { name } from "@primate/binding/go/common";
import { dim } from "rcompat/colors";
import { user } from "rcompat/env";
import { File } from "rcompat/fs";
import * as O from "rcompat/object";
import { execute } from "rcompat/stdio";
import { upperfirst } from "rcompat/string";
import { platform } from "rcompat/package";

const module = `@primate:${name}`;
const command = "go";
const run = (wasm, go, includes = "request.go") =>
  `${command} build -o ${wasm} ${go} ${includes}`;
const routes_re = /func (?<route>Get|Post|Put|Delete)/gu;
const add_setter = route => `
  var cb${route} js.Func;
  cb${route} = js.FuncOf(func(this js.Value, args[]js.Value) any {
    cb${route}.Release();
    return make_request(${route}, args[0]);
  });
  js.Global().Set("${route}", cb${route});
`;

const make_route = route =>
  `  ${route.toLowerCase()}(request) {
    const go = new globalThis.Go();
    return WebAssembly.instantiate(route, {...go.importObject}).then(result => {
      go.run(result.instance);
      return to_response(globalThis.${route}(to_request(request)));
    });
  }`;

const js_wrapper = (path, routes) => `
import to_request from "@primate/binding/go/to-request";
import to_response from "@primate/binding/go/to-response";
${
  platform() === "bun" ? `
    import route_path from "${path}" with { type: "file" };
    const route = await Bun.file(route_path).arrayBuffer();
  ` : `
    import { File } from "rcompat/fs";
    const route = new Uint8Array(await File.arrayBuffer(import.meta.dirname+"/${path}"));
  `
}
import { env } from "@primate/binding/go/common";

env();

export default {
${routes.map(route => make_route(route)).join(",\n")}
};`;

const go_wrapper = (code, routes) =>
  `// {{{ wrapper prefix
package main
import "syscall/js"
// }}} end
${code}
// {{{ wrapper postfix
func main() {
  ${routes.map(route => add_setter(route)).join("\n  ")}
  select{};
}
// }}} end`;

const get_routes = code => [...code.matchAll(routes_re)]
  .map(({ groups: { route } }) => route);

const type_map = {
  boolean: { transfer: "Bool", type: "bool" },
  i8: { transfer: "Int", type: "int8" },
  i16: { transfer: "Int", type: "int16" },
  i32: { transfer: "Int", type: "int32" },
  i64: { transfer: "Int", type: "int64" },
  f32: { transfer: "Float", type: "float32" },
  f64: { transfer: "Float", type: "float64" },
  u8: { transfer: "Int", type: "uint8" },
  u16: { transfer: "Int", type: "uint16" },
  u32: { transfer: "Int", type: "uint32", nullval: "0" },
  u64: { transfer: "Int", type: "uint64" },
  string: { transfer: "String", type: "string" },
  uuid: { transfer: "String", type: "string" },
};
const error_default = {
  Bool: false,
  Int: 0,
  Float: 0,
  String: "\"\"",
};
const root = new File(import.meta.url).up(1);

const create_meta_files = async (directory, types, app) => {
  const meta = {
    mod: "go.mod",
    sum: "go.sum",
    request: "request.go",
    session: "session.go",
  };
  const has_session = app.modules.names.includes("primate:session");

  if (!await directory.join(meta.mod).exists()) {
    const request_struct_items = [];
    const request_make_items = [];

    if (has_session) {
      request_struct_items.push(
        "Session Session",
      );
      request_make_items.push(
        "make_session(request),",
      );
    }

    const request_struct = request_struct_items.join("\n");
    const request_make = request_make_items.join("\n");

    // copy go.mod file
    await directory.join(meta.mod).write(await root.join(meta.mod).text());
    // copy go.sum file
    await directory.join(meta.sum).write(await root.join(meta.sum).text());

    const supported_types = Object.entries(types)
      .filter(([_, { base }]) => type_map[base] !== undefined);
    const dispatch_struct = supported_types.map(([name, { base }]) =>
      `Get${upperfirst(name)} func(string) (${type_map[base].type}, error)`,
    ).join("\n  ");
    const dispatch_make = supported_types.map(([name, { base }]) => {
      const { transfer, type } = type_map[base];
      const upper = upperfirst(name);
      return `func(property string) (${type}, error) {
      r := value.Get("get${upper}").Invoke(property);
      if (r.Type() == 7) {
        return ${error_default[transfer]}, errors.New(r.Invoke().String());
      }
      return ${type}(r.${transfer}()), nil;
    },`;
    }).join("\n    ");

    // copy transformed request.go file
    await directory.join(meta.request).write((await root.join(meta.request)
      .text())
      .replace("%%DISPATCH_STRUCT%%", _ => dispatch_struct)
      .replace("%%DISPATCH_MAKE%%", _ => dispatch_make)
      .replace("%%IMPORTS%%", _ => O.empty(types) ? "" : "import \"errors\"")
      .replace("%%REQUEST_STRUCT%%", _ => request_struct)
      .replace("%%REQUEST_MAKE%%", _ => request_make),
    );

    if (has_session) {
      // copy session.go file
      directory.join(meta.session).write(await root.join(meta.session).text());
    }
  }

  return ["request.go"]
    .concat(has_session ? ["session.go"] : [])
  ;
};

const env = { GOOS: "js", GOARCH: "wasm" };

export default ({ extension }) => (app, next) => {
  app.bind(extension, async (directory, file, types) => {
    const path = directory.join(file);
    const base = path.directory;
    const go = path.base.concat(".go");
    const wasm = path.base.concat(".wasm");
    const js = path.base.concat(".js");

    // create meta files
    const includes = await create_meta_files(base, types, app);

    const code = await path.text();
    const routes = get_routes(code);
    // write .go file
    await path.write(go_wrapper(code, routes));
    // write .js wrapper
    const wasm_route_path = `./${file.name.slice(0, -extension.length)}.wasm`;
    await base.join(js).write(js_wrapper(wasm_route_path, routes));

    try {
      app.log.info(`compiling ${dim(file)} to WebAssembly`, { module });
      const cwd = `${base}`;
      // compile .go to .wasm
      await execute(run(wasm, go, includes.join(" ")),
        { cwd, env: { HOME: user.HOME, ...env } });
    } catch (error) {
      ErrorInGoRoute.throw(file, error);
    }
  });

  return next(app);
};