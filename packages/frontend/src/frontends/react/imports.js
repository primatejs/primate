import FS from "rcompat/fs";
import { transform } from "rcompat/build";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { expose } from "./client/exports.js";

export const render = (component, props) => {
  const heads = [];
  const push_heads = sub_heads => {
    heads.push(...sub_heads);
  };
  const body = renderToString(createElement(component, { ...props, push_heads }));
  if (heads.filter(head => head.startsWith("<title")).length > 1) {
    const error = "May only contain one <title> across component hierarchy";
    throw new Error(error);
  }
  const head = heads.join("\n");

  return { body, head };
};

export const prepare = app => app.build.export(expose);

const options = { loader: "jsx", jsx: "automatic" };
export const compile = {
  async server(text) {
    return (await transform(text, options)).code;
  },
  async client(text) {
    return { js: (await transform(text, options)).code };
  },
};

const root_filter = /^root:react/u;

export const publish = (app, extension) => ({
  name: "react",
  setup(build) {
    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: "reactroot" };
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents ? { contents, loader: "js", resolveDir: app.root.path } : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await FS.File.text(args.path);

      // Convert JSX syntax to JavaScript
      return { contents: (await compile.client(source)).js };
    });
  },
});
