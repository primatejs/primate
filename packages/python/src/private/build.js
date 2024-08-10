const routes_re = /def (?<route>get|post|put|delete)/gu;
const get_routes = code => [...code.matchAll(routes_re)]
  .map(({ groups: { route } }) => route);

const make_route = route => `async ${route.toLowerCase()}(request) {
  const ${route}_fn = pyodide.globals.get("${route}");
  return to_response(await ${route}_fn(to_request(pyodide.toPy, request)));
}`;

const make_package = pkg => `await pyodide.loadPackage("${pkg}", {
  messageCallback: _ => _,
});\n`;

const js_wrapper = async (path, routes, packages) => `
  import file from "primate/runtime/file";
  import to_request from "@primate/python/to-request";
  import to_response from "@primate/python/to-response";
  import wrap from "@primate/python/wrap";
  import load from "@primate/python/load";

  const pyodide = await load({ indexURL: "./node_modules/pyodide" });
  const python_route = await file(${JSON.stringify(path)}).text();
  ${packages.map(make_package)}
  pyodide.runPython(wrap(python_route));
  export default {
  ${routes.map(route => make_route(route)).join(",\n")}
  };
`;

export default ({ extension, packages }) => async (app, next) => {
  app.bind(extension, async (directory, file) => {
    const path = directory.join(file);
    const base = path.directory;
    const js = path.base.concat(".js");
    const code = await path.text();
    const routes = get_routes(code);
    // write .js wrapper
    await base.join(js).write(await js_wrapper(`${path}`, routes, packages));
  });

  return next(app);
};
