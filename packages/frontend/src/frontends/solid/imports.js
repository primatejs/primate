import { File } from "rcompat/fs";
import { renderToString } from "solid-js/web";
import { transformAsync } from "@babel/core";
import solid from "babel-preset-solid";

import { expose } from "./client/exports.js";

export const render = (component, props) => {
  const heads = [];
  const push_heads = sub_heads => {
    heads.push(...sub_heads);
  };
  const body = renderToString(() => component({ ...props, push_heads }));

  if (heads.filter(head => head.startsWith("<title")).length > 1) {
    const error = "May only contain one <title> across component hierarchy";
    throw new Error(error);
  }
  const head = heads.join("\n");

  return { body, head };
};

export const prepare = app => app.build.export(expose);

export const compile = {
  async server(text) {
    const presets = [[solid, { generate: "ssr", hydratable: true }]];
    return (await transformAsync(text, { presets })).code;
  },
  async client(text) {
    const presets = [[solid, { generate: "dom", hydratable: true }]];
    return { js: (await transformAsync(text, { presets })).code };
  },
};

const root_filter = /^root:solid/u;

export const publish = (app, extension) => ({
  name: "solid",
  setup(build) {
    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: "solidroot" };
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents ? { contents, loader: "js", resolveDir: app.root.path } : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await File.text(args.path);

      // Convert JSX syntax to JavaScript
      return { contents: (await compile.client(source)).js };
    });
  },
});
