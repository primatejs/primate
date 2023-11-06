import { Path } from "rcompat/fs";
import { execSync } from "node:child_process";
const default_extension = "go";
const command = "go";
const run = name => `${command} build -o ${name.base}wasm ${name}`;
const name = "go";
const routes_re = /func (?<route>Get|Post|Put|Delete)/gu;
const add_setter = route =>
  `js.Global().Set("${route}", js.FuncOf(primate.MakeRequest(${route})))`;

const make_route = route => {
  return `  async ${route.toLowerCase()}(request) {
    const go = new globalThis.Go();
    return WebAssembly.instantiate(route, {...go.importObject}).then(result => {
      go.run(result.instance);
      return make_response(globalThis.${route}(make_request(request)));
    });
  }`;
};

const js_wrapper = routes => {
  return `import { 
  load_wasm, make_request, make_response, env,
} from "@primate/binding/go";
const route = await load_wasm(import.meta.url);
env();

export default {
${routes.map(route => make_route(route)).join(",\n")}
};`;
};

const go_wrapper = (code, routes) => {

  return `/// {{{ start of primate wrapper, prefix
package main
import "syscall/js"
// }}} end
${code}
// {{{ start primate wrapper, postfix
func main() {
  c := make(chan bool)
  ${routes.map(route => add_setter(route)).join("\n  ")}
  <-c
}
// }}} end`;
};

const get_routes = code => [...code.matchAll(routes_re)]
  .map(({ groups: { route } }) => route);

const meta = {
  mod: "go.mod",
  sum: "go.sum",
};
const go_mod = await new Path(import.meta.url).up(1).join(meta.mod).text();
const go_sum = await new Path(import.meta.url).up(1).join(meta.sum).text();
const env = {
  GOOS: "js",
  GOARCH: "wasm",
};

export default ({ extension = default_extension } = {}) => {

  return {
    name: `primate:${name}`,
    async init(app, next) {
      app.register(extension, {
        route: async (cwd, file) => {
          if (!await cwd.join(meta.mod).exists()) {
            // copy go.mod file
            await cwd.join(meta.mod).write(go_mod);
            // copy go.sum file
            await cwd.join(meta.sum).write(go_sum);
          }

          const path = cwd.join(file);
          const code = await path.text();
          const routes = get_routes(code);
          // load file
          await path.write(go_wrapper(code, routes));

          await cwd.join(file.base.slice(0, -1).concat(".js"))
            .write(js_wrapper(routes));

          execSync(run(file), { cwd: `${cwd}`, env: {
            ...process.env,
            ...env,
          } });
        },
      });
      return next(app);
    },
  };
};
