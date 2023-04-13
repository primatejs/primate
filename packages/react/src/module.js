import ReactDOMServer from "react-dom/server";
import React from "react";
import {File, Path} from "runtime-compat/fs";
import babel from "@babel/core";

const render = (component, attributes) =>
  ReactDOMServer.renderToString(React.createElement(component, attributes));

const handler = path => (component, props = {}, {status = 200} = {}) =>
  async (app, headers) => {
    const body = render(
      (await import(`${path.join(`${component}.js`)}`)).default,
      props);

    // -> spread into new Response()
    return [await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    }];
  };

export default ({directory} = {}) => ({
  register(app, next) {
    app.register("jsx", handler(directory ?? app.paths.components));
    return next(app);
  },
  async compile(app, next) {
    const jsx = ".jsx";
    const js = ".js";
    const cwd = new Path(import.meta.url).directory.path;
    const presets = ["@babel/preset-react"];
    const plugins = [["replace-import-extension", {extMapping: {[jsx]: js}}]];
    const path = directory ?? app.paths.components;
    const components = await path.list(filename => filename.endsWith(jsx));
    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const {code} = babel.transformSync(file, {cwd, presets, plugins});
      await File.write(`${component.path}.js`, code);
    }));

    return next(app);
  },
});
