import { filter } from "rcompat/object";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const routes_re = /def (?<route>get|post|put|delete)/gu;
const get_routes = code => [...code.matchAll(routes_re)]
  .map(({ groups: { route } }) => route);

const make_route = route => `async ${route.toLowerCase()}(request) {
  const ${route}_fn = pyodide.globals.get("${route}");
  return make_response(await ${route}_fn(make_request(pyodide.toPy, request)));
}`;

const make_package = pkg => `await pyodide.loadPackage("${pkg}", {
  messageCallback: _ => _,
});\n`;

const js_wrapper = async (path, routes, packages) => `
  import { make_request, make_response, wrap } from "@primate/binding/python";
  import { File } from "rcompat/fs";
  import { loadPyodide as load } from "pyodide";
  const pyodide = await load({ indexURL: "./node_modules/pyodide" });
  const file = await File.text(${JSON.stringify(path)});
  ${packages.map(make_package)}
  pyodide.runPython(wrap(file));
  export default {
  ${routes.map(route => make_route(route)).join(",\n")}
  };
`;

export default ({
  extension = ".py",
  packages = [],
} = {}) => {
  const name = "python";
  const dependencies = ["pyodide"];
  const on = filter(peers, ([key]) => dependencies.includes(key));

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `binding:${name}`);

      return next(app);
    },
    async stage(app, next) {
      app.register(extension, {
        route: async (directory, file) => {
          const path = directory.join(file);
          const base = path.directory;
          const js = path.base.concat(".js");
          const code = await path.text();
          const routes = get_routes(code);
          // write .js wrapper
          await base.join(js)
            .write(await js_wrapper(`${path}`, routes, packages));
        },
      });
      return next(app);
    },
  };
};
