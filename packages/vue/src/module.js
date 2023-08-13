import {Response, Status, MediaType} from "runtime-compat/http";
import {createSSRApp} from "vue";
import {renderToString} from "vue/server-renderer";
import {parse, compileScript} from "vue/compiler-sfc";

const render = (template, props) => {
  const app = createSSRApp({data: () => props, template});
  return renderToString(app);
};

const handler = (name, props = {}, {status = Status.OK} = {}) => async app => {
  const {build, config} = app;
  const target = build.paths.server.join(config.build.app).join(`${name}.js`);
  const body = await render(await target.text(), props);

  return new Response(await app.render({body}), {
    status,
    headers: {...app.headers(), "Content-Type": MediaType.TEXT_HTML},
  });
};

const vue = ".vue";
export default ({dynamicProps = "data"} = {}) => ({
  name: "@primate/vue",
  register(app, next) {
    app.register("vue", handler);
    return next(app);
  },
  async compile(app, next) {
    const source = app.build.paths.components;
    const target = app.build.paths.server.join(app.config.build.app);
    await target.file.create();
    const components = await source.list(filename => filename.endsWith(vue));
    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const {descriptor} = parse(file);
      const to = target.join(`${component.path}.js`.replace(source, ""));
      await to.file.write(descriptor.template.content);
    }));

    return next(app);
  },
  async publish(app, next) {
    const source = app.build.paths.components;
    const target = app.build.paths.client.join(app.config.build.app);
    await target.file.create();
    const components = await source.list(filename => filename.endsWith(vue));
    await Promise.all(components.map(async component => {
      const file = await component.file.read();
//      console.log(parse(file));
    }));

    return next(app);
  },
});
