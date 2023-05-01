import {createSSRApp} from "vue";
import {renderToString} from "vue/server-renderer";
import {parse} from "vue/compiler-sfc";
import {File} from "runtime-compat/fs";

const render = (template, props) => {
  const app = createSSRApp({data: () => props, template});
  return renderToString(app);
};

const handler = path => (component, props = {}, {status = 200} = {}) =>
  async (app, headers) => {
    const body = await render(
      await File.read(`${path.join(`${component}.js`)}`), props);

    // -> spread into new Response()
    return [await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    }];
  };

export default ({directory} = {}) => ({
  name: "@primate/vue",
  register(app, next) {
    app.register("vue", handler(directory ?? app.paths.components));
    return next(app);
  },
  async compile(app, next) {
    const vue = ".vue";
    const path = directory ?? app.paths.components;
    const components = await path.list(filename => filename.endsWith(vue));
    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const {descriptor} = parse(file);
      await File.write(`${component.path}.js`, descriptor.template.content);
    }));

    return next(app);
  },
});
