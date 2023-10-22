import * as compiler from "svelte/compiler";
import { expose } from "./client/exports.js";

export const render = (component, ...args) => {
  const { html, head } = component.render(...args);
  return { body: html, head };
};

export const prepare = async app => {
  await app.import("svelte");
  // expose code through "app", for bundlers
  await app.export({ type: "script", code: expose });
};

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
