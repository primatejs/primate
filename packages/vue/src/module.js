import {Response, Status, MediaType} from "runtime-compat/http";
import * as base from "@primate/frontend";
import {createSSRApp} from "vue";
import {renderToString} from "vue/server-renderer";
import {parse, compileTemplate} from "vue/compiler-sfc";

const handler = config => (name, props = {}, {status = Status.OK, page} = {}) =>
  async app => {
    const {make} = config;

    const imported = await make(name, props);
    const component = createSSRApp({
      render: imported.component.render,
      data: () => props,
    });
    const body = await renderToString(component);

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

  return {
    name: "primate:vue",
    register(app, next) {
      app.register(extension, handler(base.register({app, rootname})));

      return next(app);
    },
    async compile(app, next) {
      await base.compile({
        app,
        directory: directory ?? app.config.location.components,
        extension,
        rootname,
        dynamicProps,
        compile(file) {
          return compileTemplate({
            source: parse(file).descriptor.template.content,
            id: "1",
          }).code;
        },
      });

      return next(app);
    },
  };
};
