import { Path } from "rcompat/fs";
import { execSync } from "node:child_process";
const default_extension = "go";
const command = "go";
const run = name => `${command} build -o ${name.base}wasm ${name}`;
const name = "go";
const routes_re = /func (?<route>Get|Post|Put|Delete)/gu;
const add_setter = route =>
  `js.Global().Set("${route}", js.FuncOf(primate.MakeRequest(${route})))`;

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
  c := make(chan bool)
  ${routes.map(route => add_setter(route)).join("\n  ")}
  <-c
}
// }}} end`;

const get_routes = code => [...code.matchAll(routes_re)]
  .map(({ groups: { route } }) => route);

const create_meta_files = async directory => {
  const meta = { mod: "go.mod", sum: "go.sum" };
  const base = new Path(import.meta.url).up(1);

  if (!await directory.join(meta.mod).exists()) {
    // copy go.mod file
    await directory.join(meta.mod).write(await base.join(meta.mod).text());
    // copy go.sum file
    await directory.join(meta.sum).write(await base.join(meta.sum).text());
  }
};

export default ({ extension = default_extension } = {}) => {
  const env = { GOOS: "js", GOARCH: "wasm" };

  return {
    name: `primate:${name}`,
    async init(app, next) {
      app.register(extension, {
        route: async (cwd, file) => {
          await create_meta_files(cwd);

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
