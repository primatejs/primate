import {Response, Status, MediaType} from "runtime-compat/http";
import * as base from "../common/exports.js";
import {client, create_root, rootname, hydrate} from "./client/exports.js";

const normalize = base.normalize("react");
const type = "module";

const handler = config => (name, props = {}, {status = Status.OK, page} = {}) =>
  async (app, {layouts = [], as_layout} = {}, request) => {
    const {make, root, render} = config;
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
    const body = render(imported, {
      components: components.map(({component}) => component),
      data,
    });

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
  dynamicProps = "data",
  extension = "jsx",
} = {}) => {
  // server and client side compile the same files
  let imports = {};

  return {
    name: "primate:react",
    async init(app, next) {
      await app.depend(["react-dom", "react", "esbuild"], "frontend:react");

      imports = await import("./imports.js");

      return next(app);
    },
    register(app, next) {
      const {render} = imports;

      app.register(extension, handler(base.register({app, rootname, render})));

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
        compile: imports.compile.server,
      });

      return next(app);
    },
    async publish(app, next) {
      // import libs
      await imports.depend(app);
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
