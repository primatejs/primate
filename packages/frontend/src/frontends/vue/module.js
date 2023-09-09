import {Response, Status, MediaType} from "runtime-compat/http";
import {filter} from "runtime-compat/object";
import {register, compile, peers} from "../common/exports.js";
import depend from "../../depend.js";

const name = "vue";
const dependencies = ["vue"];
const default_extension = "vue";

const handler = config => (name, props = {}, {status = Status.OK, page} = {}) =>
  async app => {
    const {make, createSSRApp, render} = config;

    const imported = await make(name, props);
    const component = createSSRApp({
      render: imported.component.render,
      data: () => props,
    });
    const body = await render(component);

    return new Response(await app.render({body, page}), {
      status,
      headers: {...app.headers(), "Content-Type": MediaType.TEXT_HTML},
    });
  };

export default ({
  directory,
  extension = default_extension,
} = {}) => {
  const on = filter(peers, ([key]) => dependencies.includes(key));
  const rootname = name;
  let imports = {};

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);

      imports = await import("./imports.js");

      return next(app);
    },
    register(app, next) {
      app.register(extension, handler(register({
        app,
        rootname,
        createSSRApp: imports.createSSRApp,
        render: imports.render,
      })));

      return next(app);
    },
    async compile(app, next) {
      await compile({
        app,
        directory: directory ?? app.config.location.components,
        extension,
        rootname,
        compile: imports.compile.server,
      });

      return next(app);
    },
  };
};
