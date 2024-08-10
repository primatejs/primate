import file from "@rcompat/fs/file";

const routes_re = /def (?<route>get|post|put|delete)/gu;
const get_routes = code => [...code.matchAll(routes_re)]
  .map(({ groups: { route } }) => route);

const this_directory = file(import.meta.url).up(1);
const session_rb = await this_directory.join("session.rb").text();
const request = await this_directory.join("./request.rb").text();
const make_route = route => `async ${route.toLowerCase()}(request) {
    return to_response(await environment.callAsync("run_${route}",
      vm.wrap(request), vm.wrap(helpers)));
  },`;

const type_map = {
  i8: { transfer: "to_i", type: "int8" },
  i16: { transfer: "to_i", type: "int16" },
  i32: { transfer: "to_i", type: "int32" },
  i64: { transfer: "to_i", type: "int64" },
  f32: { transfer: "to_f", type: "float32" },
  f64: { transfer: "to_f", type: "float64" },
  u8: { transfer: "to_i", type: "uint8" },
  u16: { transfer: "to_i", type: "uint16" },
  u32: { transfer: "to_i", type: "uint32", nullval: "0" },
  u64: { transfer: "to_i", type: "uint64" },
  string: { transfer: "to_s", type: "string" },
  uuid: { transfer: "to_s", type: "string" },
};

const create_ruby_wrappers = routes => routes.map(route =>
  `def run_${route}(js_request, helpers)
  ${route}(Request.new(js_request, helpers))
end`).join("\n");

const js_wrapper = async (path, routes, app) => {
  const has_session = app.modules.names.includes("primate:session");
  const classes = [];
  const request_initialize = [];
  const request_defs = [];
  if (has_session) {
    classes.push(session_rb);
    request_initialize.push(
      "@session = Session.new(request[\"session\"], helpers)",
    );
    request_defs.push(`def session
  @session
end`);
  }

  return `
  import to_response from "@primate/ruby/to-response";
  import helpers from "@primate/ruby/helpers";
  import default_ruby_vm from "@primate/ruby/default-ruby-vm";
  import ruby from "@primate/ruby/ruby";
  import file from "primate/runtime/file";

const { vm } = await default_ruby_vm(ruby);
const code = await file(${JSON.stringify(path)}).text();
const wrappers = ${JSON.stringify(create_ruby_wrappers(routes))};
const request = ${JSON.stringify(request
    .replace("%%CLASSES%%", _ => classes.join("\n"))
    .replace("%%REQUEST_INITIALIZE%%", _ => request_initialize.join("\n"))
    .replace("%%REQUEST_DEFS%%", _ => request_defs.join("\n")))};

const environment = await vm.evalAsync(request+code+wrappers);

export default {
  ${routes.map(route => make_route(route)).join("\n  ")}
};
`;
};

export default ({ extension } = {}) => (app, next) => {
  app.bind(extension, async (directory, route) => {
    const path = directory.join(route);
    const base = path.directory;
    const js = path.base.concat(".js");
    const code = await path.text();
    const routes = get_routes(code);
    // write .js wrapper
    await base.join(js).write(await js_wrapper(`${path}`, routes, app));
  });

  return next(app);
};
