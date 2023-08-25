import {Response, Status, MediaType} from "runtime-compat/http";
import * as base from "../common/exports.js";

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
  dynamicProps,
  extension = "vue",
} = {}) => {
  const rootname = "vue";
  let imports = {};

  return {
    name: "primate:vue",
    async init(app, next) {
      await app.depend(["vue"], "frontend:vue");

      imports = await import("./imports.js");

      return next(app);
    },
    register(app, next) {
      const {createSSRApp, render} = imports;

      app.register(extension, handler(base.register({app, rootname,
        createSSRApp, render})));

      return next(app);
    },
    async compile(app, next) {
      await base.compile({
        app,
        directory: directory ?? app.config.location.components,
        extension,
        rootname,
        dynamicProps,
        compile: imports.compile.server,
      });

      return next(app);
    },
  };
};
