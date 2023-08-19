import {Path} from "runtime-compat/fs";
import {Response, Status, MediaType} from "runtime-compat/http";
import * as base from "@primate/frontend";
import {renderToString as render} from "solid-js/web";
import {transformAsync} from "@babel/core";
import solid from "babel-preset-solid";
import {client, create_root, rootname, hydrate} from "./client/exports.js";

const normalize = base.normalize("solid");

const import$ = async (module, app, copy_dependency) => {
  const {library, packager} = app;
  const {http: {static: {root}}} = app.config;
  const parts = module.split("/");
  const path = [library, ...parts];
  const pkg = await Path.resolve().join(...path, packager).json();
  if (copy_dependency) {
    const dependency = Path.resolve().join(...path);
    const to = app.runpath(app.config.location.client, library, ...parts);
    await dependency.file.copy(`${to}`);
  }

  const entry = pkg.exports["."].browser.import;
  app.importmaps[module] = new Path(root, library, module, entry).path;
};

const type = "module";

const handler = config => (name, props = {}, {status = Status.OK, page} = {}) =>
  async (app, {layouts = [], as_layout} = {}, request) => {
    const {make, root} = config;
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
  return {
    name: "primate:solid",
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
        async compile(file) {
          const presets = [[solid, {generate: "ssr", hydratable: true}]];
          return (await transformAsync(file, {presets})).code;
        },
      });

      return next(app);
    },
    async publish(app, next) {
      // import libs
      await import$("solid-js", app, true);
      await import$("solid-js/web", app);
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
        async compile(file) {
          const presets = [[solid, {generate: "dom", hydratable: true}]];
          return {js: (await transformAsync(file, {presets})).code};
        },
      });

      return next(app);
    },
  };
};
