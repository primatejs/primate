import crypto from "runtime-compat/crypto";
import {Path} from "runtime-compat/fs";
import {Response, Status, MediaType} from "runtime-compat/http";
import ReactDOMServer from "react-dom/server";
import React from "react";
import {tryreturn} from "runtime-compat/async";
import errors from "./errors.js";
import esbuild from "esbuild";
import {client, create_root, hydrate, rootname} from "./client/exports.js";

const filename = `${rootname}.js`;
const type = "module";

const encoder = new TextEncoder();
const hash = async (string, algorithm = "sha-256") => {
  const base = 16;
  const target_pad_length = 2;
  const target_slice = 12;
  const bytes = await crypto.subtle.digest(algorithm, encoder.encode(string));
  return Array.from(new Uint8Array(bytes))
    .map(byte => byte.toString(base).padStart(target_pad_length, "0"))
    .join("")
    .slice(0, target_slice);
};
const normalize = async path => `react_${await hash(path)}`;

const render = (component, props) =>
  ReactDOMServer.renderToString(React.createElement(component, props));

const import$ = async (name, app) => {
  const {config: {build: {modules}}, build: {paths}} = app;
  const root = "index";
  const [module, submodule = root] = name.split("/");
  const filename = new Path("client", "imports", module, `${submodule}.js`)
  const r = new Path(import.meta.url).up(1).join(filename);
  const {outputFiles: [{text}]} = await esbuild.build({
      entryPoints: [`${r}`],
      bundle: true,
      format: "esm",
      write: false,
    });
  const to = paths.client.join(modules, module);
  await to.file.create();
  await to.join(`${submodule}.js`).file.write(text);
  const client$ = new Path(`${to}`.replace(paths.client, _ => ""), `${submodule}.js`);
  app.importmaps[name] = `${client$}`;
};

const load = async path =>
  tryreturn(async () => (await import(`${path}.js`)).default)
    .orelse(_ => errors.MissingComponent.throw(path.name, path));

const make_component = base => async (name, props) =>
  ({name, component: await load(base.join(name)), props});

const handler = (name, props = {}, {status = Status.OK} = {}) =>
  async (app, {layouts = [], as_layout} = {}, request) => {
    const {build, config} = app;
    const target = build.paths.server.join(config.build.app).join(`${name}.js`);
    const {paths} = app.build;
    const make = make_component(paths.server.join(app.config.build.app));
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

    //const body = render((await import(target)).default, data);
    //const component = await normalize(name);

    const root = paths.server.join(filename);
    const imported = (await import(root)).default;
    const body = render(imported, {
      components: components.map(({component}) => component),
      data,
    });
    const code = client({names, data});

    await app.publish({code, type, inline: true});
    // needs to be called before app.render
    const headers$ = await app.headers();

    return new Response(await app.render({body}), {
      status,
      headers: {...headers$, "Content-Type": MediaType.TEXT_HTML},
    });
  };

const jsx = ".jsx";

export default ({dynamicProps = "data"} = {}) => ({
  name: "@primate/react",
  register(app, next) {
    app.register("jsx", handler);
    return next(app);
  },
  async compile(app, next) {
    const source = app.build.paths.components;
    const target = app.build.paths.server.join(app.config.build.app);
    await target.file.create();
    const components = await source.list(filename => filename.endsWith(jsx));
    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const to = target.join(`${component.path}.js`.replace(source, ""));
      const {code} = await esbuild.transform(file, {
        loader: "jsx",
        jsx: "automatic",
      });
      await to.file.write(code);
    }));

    const root = create_root(app.layoutDepth, dynamicProps);
    const to = app.build.paths.server.join(filename);
    await to.file.write(root);

    return next(app);
  },
  async publish(app, next) {
    const source = app.build.paths.components;
    const target = app.build.paths.client.join(app.config.build.app);
    await target.file.create();

    // create client components
    const components = await source.list(filename => filename.endsWith(jsx));
    await Promise.all(components.map(async component => {
      const name = component.path.replace(`${source}/`, "");
      const file = await component.file.read();
      const {code} = await esbuild.transform(file, {
        loader: "jsx",
        jsx: "automatic",
      });
      const to = target.join(`${component.path}.js`.replace(source, ""));
      await to.file.write(code);
      const imported = await normalize(name);
      app.bootstrap({
        type: "script",
        code: `export {default as ${imported}} from "./${name}.js";\n`,
      });
    }));

    await import$("react", app);
    await import$("react-dom/client", app);
    await import$("react/jsx-runtime", app);

    app.bootstrap({type: "script", code: hydrate});

    {
      const code = create_root(app.layoutDepth, dynamicProps);
      const src = new Path(app.config.http.static.root, filename);
      await app.publish({src, code, type});
    }
    {
      const code = `export {default as ${rootname}} from "../${filename}";\n`;
      app.bootstrap({type: "script", code});
    }

    return next(app);
  },
});
