import FS from "rcompat/fs";
import * as compiler from "svelte/compiler";
import { expose } from "./client/exports.js";

export const render = (component, ...args) => {
  const { html, head } = component.render(...args);
  return { body: html, head };
};

export const prepare = app => app.build.export(expose);

export const compile = {
  server(text) {
    const options = { generate: "ssr", hydratable: true };
    return compiler.compile(text, options).js.code;
  },
  client(text) {
    const options = { generate: "dom", hydratable: true };
    const { js, css } = compiler.compile(text, options);
    return { js: js.code, css: css.code };
  },
};

const css_filter = /\.sveltecss$/u;
const root_filter = /^root:svelte$/u;

export const publish = (app, extension) => ({
  name: "svelte",
  setup(build) {
    build.onResolve({ filter: css_filter }, ({ path }) => {
      return { path, namespace: "sveltecss" };
    });
    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: "svelteroot" };
    });
    build.onLoad({ filter: css_filter }, ({ path }) => {
      const contents = app.build.load(FS.File.webpath(path));
      return contents ? { contents, loader: "css", resolveDir: app.root.path } : null;
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents ? { contents, loader: "js", resolveDir: app.root.path } : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await FS.File.text(args.path);

      // Convert Svelte syntax to JavaScript
      const { js, css } = compile.client(source);
      let contents = js;
      if (css !== null) {
        const path = FS.File.webpath(`${args.path}css`);
        app.build.save(path, css);
        contents += `\nimport "${path}";`;
      }
      return { contents };
    });
  },
});
