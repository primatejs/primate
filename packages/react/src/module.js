import {Path} from "runtime-compat/fs";
import {Response, Status, MediaType} from "runtime-compat/http";
import ReactDOMServer from "react-dom/server";
import React from "react";
import babel from "@babel/core";

const render = (component, attributes) =>
  ReactDOMServer.renderToString(React.createElement(component, attributes));

const handler = (name, props = {}, {status = Status.OK} = {}) => async app => {
  const {build, config} = app;
  const target = build.paths.server.join(config.build.app).join(`${name}.js`);
  const body = render((await import(target)).default, props);

  return new Response(await app.render({body}), {
    status,
    headers: {...app.headers(), "Content-Type": MediaType.TEXT_HTML},
  });
};

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
    const jsx = ".jsx";
    const js = ".js";
    const cwd = new Path(import.meta.url).directory.path;
    const presets = ["@babel/preset-react"];
    const plugins = [["replace-import-extension", {extMapping: {[jsx]: js}}]];
    const components = await source.list(filename => filename.endsWith(jsx));
    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const {code} = babel.transformSync(file, {cwd, presets, plugins});
      const to = target.join(`${component.path}.js`.replace(source, ""));
      await to.file.write(code);
    }));

    return next(app);
  },
});
