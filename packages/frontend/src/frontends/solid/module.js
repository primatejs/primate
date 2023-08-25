import {Response, Status, MediaType} from "runtime-compat/http";
import * as base from "../common/exports.js";

const normalize = base.normalize("solid");
const type = "module";

const handler = config => (name, props = {}, {status = Status.OK, page} = {}) =>
  async (app, {layouts = [], as_layout} = {}, request) => {
    const {make, root, render, client} = config;
    const {headers} = request;
    const options = {
      liveview: app.liveview !== undefined,
    };
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
    const body = render(() => imported({
      components: components.map(({component}) => component),
      data,
    }));

    const code = client({names, data}, options);

    await app.publish({code, type, inline: true});
    // needs to be called before app.render
    const headers$ = await app.headers();

    return new Response(await app.render({body, page}), {
      status,
      headers: {...headers$, "Content-Type": MediaType.TEXT_HTML},
    });
  };

export default ({
  directory,
  dynamicProps,
  extension = "jsx",
} = {}) => {
  let imports = {};
  let client = {};

  return {
    name: "primate:solid",
    async init(app, next) {
      await app.depend(["solid-js", "@babel/core", "babel-preset-solid"],
        "frontend:solid");

      imports = await import("./imports.js");
      client = await import("./client/exports.js");

      return next(app);
    },
    register(app, next) {
      const {rootname} = client;
      const {render} = imports;

      app.register(extension, handler(base.register({app, rootname, render,
        client: client.default})));

      return next(app);
    },
    async compile(app, next) {
      const {rootname, create_root} = client;

      await base.compile({
        app,
        directory: directory ?? app.config.location.components,
        extension,
        rootname,
        create_root,
        dynamicProps,
        compile: imports.compile.server,
      });

      return next(app);
    },
    async publish(app, next) {
      const {rootname, create_root, hydrate} = client;

      // import libs
      await imports.depend("solid-js", app, true);
      await imports.depend("solid-js/web", app);
      // export hydration code
      app.export({type: "script", code: hydrate});

      await base.publish({
        app,
        directory: directory ?? app.config.location.components,
        extension,
        rootname,
        create_root,
        dynamicProps,
        normalize,
        compile: imports.compile.client,
      });

      return next(app);
    },
  };
};
