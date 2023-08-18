import {File} from "runtime-compat/fs";
import {Response, Status, MediaType} from "runtime-compat/http";
import {tryreturn} from "runtime-compat/async";

import {createSSRApp} from "vue";
import {renderToString} from "vue/server-renderer";
import {parse, compileTemplate} from "vue/compiler-sfc";

import errors from "./errors.js";

const load = async path =>
  tryreturn(_ => import(`${path}.js`))
    .orelse(_ => errors.MissingComponent.throw(path.name, path));

const make_component = base => async (name, props) =>
  ({name, component: await load(base.join(name)), props});

const handler = (name, props = {}, {status = Status.OK, page} = {}) =>
  async app => {
    const {paths} = app.build;
    const make = make_component(paths.server.join(app.config.paths.components));

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
  extension = "vue",
} = {}) => {
  const env = {};
  const copy_re = new RegExp(`^.*.(?:${extension})$`, "u");
  const collect_re = new RegExp(`^.*.${extension}$`, "u");
  const extensions = {
    from: `.${extension}`,
    to: `.${extension}.js`,
  };

  return {
    name: "primate:vue",
    init(app, next) {
      env.source = app.build.paths.components;
      return next(app);
    },
    register(app, next) {
      app.register(extension, handler);
      return next(app);
    },
    async compile(app, next) {
      // create client components
      await app.copy(app.paths.components, env.source, copy_re);
      const components = await env.source.collect(collect_re);
      const target = app.build.paths.server.join(app.config.paths.components);
      await target.file.create();

      await Promise.all(components.map(async component => {
        const file = await component.file.read();
        const {descriptor: {template: {content}}} = parse(file);
        const {code} = compileTemplate({
          source: content,
          id: "1",
        });
        const to = target.join(`${component.path}.js`.replace(env.source, ""));
        await to.file.write(code.replaceAll(extensions.from, extensions.to));
      }));

      return next(app);
    },
  };
};
