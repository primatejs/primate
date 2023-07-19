import {Status, MediaType} from "runtime-compat/http";
import {createSSRApp} from "vue";
import {renderToString} from "vue/server-renderer";
import {parse} from "vue/compiler-sfc";

const render = (template, props) => {
  const app = createSSRApp({data: () => props, template});
  return renderToString(app);
};

const handler = _ => (name, props = {}, {
  status = Status.OK,
} = {}) => async app => {
  const {paths, config} = app;
  const target = paths.server.join(config.build.app).join(`${name}.js`);
  const body = await render(await target.text(), props);

  // -> spread into new Response()
  return [await app.render({body}), {
    status,
    headers: {...app.headers(), "Content-Type": MediaType.TEXT_HTML},
  }];
};

export default ({directory} = {}) => ({
  name: "@primate/vue",
  register(app, next) {
    app.register("vue", handler(directory ?? app.paths.components));
    return next(app);
  },
  async compile(app, next) {
    const source = directory ?? app.paths.components;
    const target = app.paths.server.join(app.config.build.app);
    await target.file.create();
    const vue = ".vue";
    const components = await source.list(filename => filename.endsWith(vue));
    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const {descriptor} = parse(file);
      const to = target.join(`${component.path}.js`.replace(source, ""));
      await to.file.write(descriptor.template.content);
    }));

    return next(app);
  },
});
