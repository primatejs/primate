import crypto from "runtime-compat/crypto";
import {Path} from "runtime-compat/fs";
import {Response, Status, MediaType} from "runtime-compat/http";
import ReactDOMServer from "react-dom/server";
import React from "react";
import esbuild from "esbuild";
import {client, hydrate} from "./client/exports.js";

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

const import$ = async (file, submodule, importname, app) => {
  const {config: {build: {modules}}, build: {paths}} = app;
  const name = "index.js";
  const r = new Path(import.meta.url).up(1).join("client", "imports", file);
  const {outputFiles: [{text}]} = await esbuild.build({
      entryPoints: [`${r}`],
      bundle: true,
      format: "esm",
      write: false,
    });
  const to = paths.client.join(modules, submodule);
  await to.file.create();
  await to.join(name).file.write(text);
  const client$ = new Path(`${to}`.replace(paths.client, _ => ""), name);
  app.importmaps[importname] = `${client$}`;
};

const handler = (name, props = {}, {status = Status.OK} = {}) => async app => {
  const {build, config} = app;
  const target = build.paths.server.join(config.build.app).join(`${name}.js`);
  const data = {data: props};
  const body = render((await import(target)).default, data);
  const component = await normalize(name);

  const code = client(component, data);
  const type = "module";

  await app.publish({code, type, inline: true});

  const headers$ = await app.headers();

  return new Response(await app.render({body}), {
    status,
    headers: {...headers$, "Content-Type": MediaType.TEXT_HTML},
  });
};

const jsx = ".jsx";

export default _ => ({
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
      const {code} = await esbuild.transform(file, {loader: "jsx"});
      await to.file.write(code);
    }));

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
      const {code} = await esbuild.transform(file, {loader: "jsx"});
      const to = target.join(`${component.path}.js`.replace(source, ""));
      await to.file.write(code);
      const imported = await normalize(name);
      app.bootstrap({
        type: "script",
        code: `export {default as ${imported}} from "./${name}.js";\n`,
      });
    }));

    await import$("react.js", "react", "react", app);
    await import$("react-dom.js", "react-dom", "react-dom/client", app);

    app.bootstrap({type: "script", code: hydrate});
    return next(app);
  },
});
