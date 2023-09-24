import * as compiler from "svelte/compiler";

export const render = (component, ...args) => {
  const { html, head } = component.render(...args);
  return { body: html, head };
};

export const prepare = async app => {
  await app.import("svelte");
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
