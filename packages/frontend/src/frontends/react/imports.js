import { Path } from "rcompat/fs";
import { valmap } from "rcompat/object";

import { renderToString } from "react-dom/server";
import { createElement } from "react";
import esbuild from "esbuild";

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

const options = { loader: "jsx", jsx: "automatic" };
export const compile = {
  async server(text) {
    return (await esbuild.transform(text, options)).code;
  },
  async client(text) {
    return { js: (await esbuild.transform(text, options)).code };
  },
};

export const prepare = async app => {
  const to_path = path => new Path(import.meta.url).up(1).join(...path);
  const { library } = app;
  const module = "react";
  const $base = ["client", "imports"];
  const index = $base.concat("index.js");
  const imports = {
    react: "react.js",
    "react-dom/client": "react-dom.js",
    "react/jsx-runtime": "jsx-runtime.js",
  };

  const to = app.runpath(app.config.location.client, app.library, module);
  await esbuild.build({
    entryPoints: [`${to_path(index)}`],
    bundle: true,
    format: "esm",
    outdir: `${to}`,
  });
  await to.create();
  await Promise.all(Object.values(imports).map(async value =>
    to.join(value).write(await to_path($base.concat(value)).text())));

  app.importmaps = {
    ...app.importmaps,
    ...valmap(imports, value => `${new Path("/", library, module, value)}`),
  };

  await app.import("@primate/frontend", "react");
  // expose code through "app", for bundlers
  await app.export({ type: "script", code: expose });
};
