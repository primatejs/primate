import { Path } from "rcompat/fs";
import { upperfirst } from "rcompat/string";
import { execSync } from "node:child_process";
const default_extension = "go";
const command = "go";
const run = name => `${command} build -o ${name.base}wasm ${name} request.go`;
const routes_re = /func (?<route>Get|Post|Put|Delete)/gu;
const add_setter = route =>
  `js.Global().Set("${route}", js.FuncOf(make_request(${route})));`;

const make_route = route =>
  `  ${route.toLowerCase()}(request) {
    const go = new globalThis.Go();
    return WebAssembly.instantiate(route, {...go.importObject}).then(result => {
      go.run(result.instance);
      return make_response(globalThis.${route}(make_request(request)));
    });
  }`;

const js_wrapper = routes =>
  `import {
  load_wasm, make_request, make_response, env,
} from "@primate/binding/go";

const route = await load_wasm(import.meta.url);
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
  c := make(chan bool);
  ${routes.map(route => add_setter(route)).join("\n  ")}
  <-c;
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
  string: { transfer: "String", type: "string", nullval: "\"\"" },
};
const root = new Path(import.meta.url).up(1);

const create_meta_files = async (directory, types) => {
  const meta = { mod: "go.mod", sum: "go.sum", request: "request.go" };

  if (!await directory.join(meta.mod).exists()) {
    // copy go.mod file
    await directory.join(meta.mod).write(await root.join(meta.mod).text());
    // copy go.sum file
    await directory.join(meta.sum).write(await root.join(meta.sum).text());
    // copy request.go file
    const has_types = Object.keys(types).length > 0;
    const struct = Object.entries(types).map(([name, { base }]) =>
      `Get${upperfirst(name)} func(string) (${type_map[base].type}, error)`,
    ).join("\n  ");
    const init = Object.entries(types).map(([name, { base }]) => {
      const { transfer, type, nullval } = type_map[base];
      const upper = upperfirst(name);
      return `func(property string) (${type}, error) {
      r := value.Get("get${upper}").Invoke(property);
      if (r.Type() == 7) {
        return ${nullval}, errors.New(r.Invoke().String());
      }
      return ${type}(r.${transfer}()), nil;
    },`;
    }).join("\n    ");
    await directory.join(meta.request).write((await root.join(meta.request)
      .text())
      .replace("%%DISPATCH_STRUCT%%", _ => struct)
      .replace("%%DISPATCH_INIT%%", _ => init)
      .replace("%%IMPORTS%%", _ => has_types ? "import \"errors\"" : ""),
    );
  }
};

export default ({ extension = default_extension } = {}) => {
  const name = "go";
  const env = { GOOS: "js", GOARCH: "wasm" };

  return {
    name: `primate:${name}`,
    async init(app, next) {
      app.register(extension, {
        route: async (cwd, file, types) => {
          await create_meta_files(cwd, types);

          const path = cwd.join(file);
          const code = await path.text();
          const routes = get_routes(code);
          // load file
          await path.write(go_wrapper(code, routes));

          await cwd.join(file.base.slice(0, -1).concat(".js"))
            .write(js_wrapper(routes));

          execSync(run(file), { cwd: `${cwd}`,
              env: {
                ...process.env,
                ...env,
              },
            });
        },
      });
      return next(app);
    },
  };
};
