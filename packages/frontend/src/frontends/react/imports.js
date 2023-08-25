import {Path} from "runtime-compat/fs";
import {valmap} from "runtime-compat/object";

import {renderToString} from "react-dom/server";
import {createElement} from "react";
import esbuild from "esbuild";

export const render = (...args) => renderToString(createElement(...args));

const options = {loader: "jsx", jsx: "automatic"};
export const compile = {
  async server(text) {
    return (await esbuild.transform(text, options)).code;
  },
  async client(text) {
    return {js: (await esbuild.transform(text, options)).code};
  },
};

export const depend = async app => {
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

  const to = app.runpath(app.config.location.client, app.library, module);
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
