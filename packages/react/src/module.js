import {Path} from "runtime-compat/fs";
import {valmap} from "runtime-compat/object";
import {Response, Status, MediaType} from "runtime-compat/http";
import * as base from "@primate/frontend";
import ReactDOMServer from "react-dom/server";
import React from "react";
import esbuild from "esbuild";
import {client, create_root, rootname, hydrate} from "./client/exports.js";

const normalize = base.normalize("react");
const render = (component, props) =>
  ReactDOMServer.renderToString(React.createElement(component, props));

const import$ = async app => {
  const to_path = path => new Path(import.meta.url).up(1).join(...path);
  const {library} = app;
  const module = "react";
  const $base = ["client", "imports"];
  const index = $base.concat("index.js");
  const imports = {
    react: "react.js",
    "react-dom/client": "react-dom.js",
    "react/jsx-runtime": "jsx-runtime.js",
  };

  const to = app.runpath(app.config.location.client, library, module);
  await esbuild.build({
    entryPoints: [`${to_path(index)}`],
    bundle: true,
    format: "esm",
    outdir: `${to}`,
  });
  await to.file.create();
  await Promise.all(Object.values(imports).map(async value =>
    to.join(value).file.write(await to_path($base.concat(value)).text())));

  app.importmaps = {
    ...app.importmaps,
    ...valmap(imports, value => `${new Path("/", library, module, value)}`),
  };
};

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
  const options = {loader: "jsx", jsx: "automatic"};

  return {
    name: "primate:react",
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
        async compile(code) {
          return (await esbuild.transform(code, options)).code;
        },
      });

      return next(app);
    },
    async publish(app, next) {
      // import libs
      await import$(app);
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
        async compile(code) {
          return {js: (await esbuild.transform(code, options)).code};
        },
      });

      return next(app);
    },
  };
};
