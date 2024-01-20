import { File } from "rcompat/fs";
import { filter } from "rcompat/object";
import { upperfirst } from "rcompat/string";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const routes_re = /def (?<route>get|post|put|delete)/gu;
const get_routes = code => [...code.matchAll(routes_re)]
  .map(({ groups: { route } }) => route);

const directory = new File(import.meta.url).up(1);
const request = await directory.join("./request.rb").text();
const make_route = route => `async ${route.toLowerCase()}(request) {
    return make_response(environment.call("run_${route}", vm.wrap(request)));
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
  `def run_${route}(js_request)
  ${route}(Request.new(js_request))
end`).join("\n");

const js_wrapper = async (path, routes, types) => {
  const supported_types = Object.entries(types)
    .filter(([_, { base }]) => type_map[base] !== undefined);
  const type_defs = supported_types.map(([name, { base }]) => {
    const { transfer } = type_map[base];
    return `def get${upperfirst(name)}(name)
    @dispatcher.call("get${upperfirst(name)}", name).${transfer}
  end`;
  }).join("\n  ");

  return `import { vm, make_response } from "@primate/binding/ruby";
import { File } from "rcompat/fs";
const file = await new File("${path}").text();
const wrappers = ${JSON.stringify(create_ruby_wrappers(routes))};
const request = ${JSON.stringify(request
    .replace("%%DISPATCH_DEFS%%", _ => type_defs))};

const environment = await vm.evalAsync(request+file+wrappers);
export default {
  ${routes.map(route => make_route(route)).join("\n  ")}
};
`;
};

export default ({
  extension = ".rb",
} = {}) => {
  const name = "ruby";
  const dependencies = ["@ruby/head-wasm-wasi", "@ruby/wasm-wasi"];
  const on = filter(peers, ([key]) => dependencies.includes(key));

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `binding:${name}`);

      return next(app);
    },
    async stage(app, next) {
      app.register(extension, {
        route: async (directory, file, types) => {
          const path = directory.join(file);
          const base = path.directory;
          const js = path.base.concat(".js");
          const code = await path.text();
          const routes = get_routes(code);
          // write .js wrapper
          await base.join(js).write(await js_wrapper(`${path}`, routes, types));
        },
      });
      return next(app);
    },
  };
};
