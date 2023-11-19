import { filter } from "rcompat/object";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const routes_re = /def (?<route>get|post|put|delete)/gu;
const get_routes = code => [...code.matchAll(routes_re)]
  .map(({ groups: { route } }) => route);

const make_route = route => `${route.toLowerCase()}(request) {
  const ${route}_fn = pyodide.globals.get("${route}");
  return make_response(${route}_fn(make_request(request)));
}`;

const js_wrapper = async (path, routes) => `
  import { make_request, make_response } from "@primate/binding/python";
  import { Path } from "rcompat/fs";
  import { loadPyodide as load } from "pyodide";
  const pyodide = await load({ indexURL: "./node_modules/pyodide" });
  const file = await new Path("${path}").text();
  pyodide.runPython(file);

  export default {
  ${routes.map(route => make_route(route)).join(",\n")}
  };
`;

export default ({
  extension = ".py",
} = {}) => {
  const name = "python";
  const dependencies = ["pyodide"];
  const on = filter(peers, ([key]) => dependencies.includes(key));

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      return next(app);
    },
    async stage(app, next) {
      app.register(extension, {
        route: async (directory, file) => {
          const path = directory.join(file);
          const code = await path.text();
          const routes = get_routes(code);
          await directory.join(file.base.concat(".js"))
            .write(await js_wrapper(`${path}`, routes));
        },
      });
      return next(app);
    },
  };
};
