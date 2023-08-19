import {Response, Status, MediaType} from "runtime-compat/http";
import * as base from "@primate/frontend";
import * as compiler from "svelte/compiler";
import {client, create_root, rootname} from "./client/exports.js";

const normalize = base.normalize("svelte");
const type = "module";

const handler = config => (name, props = {}, {status = Status.OK, page} = {}) =>
  async (app, {layouts = [], as_layout} = {}, request) => {
    const {make, root} = config;
    const options = {
      liveview: app.liveview !== undefined,
    };
    const {headers} = request;
    if (as_layout) {
      return make(name, props);
    }
    const components = (await Promise.all(layouts.map(layout =>
      layout(app, {as_layout: true}, request)
    )))
      /* set the actual page as the last component */
      .concat(await make(name, props));

    const data = components.map(component => component.props);
    const names = await Promise.all(components.map(component =>
      normalize(component.name)));
    if (options.liveview && headers.get(app.liveview.header) !== undefined) {
      return new Response(JSON.stringify({names, data}), {
        status,
        headers: {...await app.headers(),
          "Content-Type": MediaType.APPLICATION_JSON},
      });
    }

    const imported = (await import(root)).default;
    const {html: body, head} = imported.render({
      components: components.map(({component}) => component),
      data,
    });

    const code = client({names, data}, options);

    await app.publish({code, type, inline: true});
    // needs to be called before app.render
    const headers$ = await app.headers();

    return new Response(await app.render({body, page, head}), {
      status,
      headers: {...headers$, "Content-Type": MediaType.TEXT_HTML},
    });
  };

export default ({
  dynamicProps = "data",
  extension = "svelte",
  directory,
} = {}) => {
  return {
    name: "primate:svelte",
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
        create_root,
        dynamicProps,
        compile(file) {
          const options = {generate: "ssr", hydratable: true};
          return compiler.compile(file, options).js.code;
        },
      });

      return next(app);
    },
    async publish(app, next) {
      // import libs
      await app.import("svelte");

      await base.publish({
        app,
        directory: directory ?? app.config.location.components,
        extension,
        rootname,
        create_root,
        dynamicProps,
        normalize,
        compile(file) {
          const options = {generate: "dom", hydratable: true};
          const {js, css} = compiler.compile(file, options);
          return {js: js.code, css: css.code};
        },
      });

      return next(app);
    },
  };
};
