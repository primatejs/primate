import * as compiler from "svelte/compiler";

export const server = text => {
  const options = { generate: "ssr", hydratable: true };
  return compiler.compile(text, options).js.code;
};

export const client = text => {
  const options = { generate: "dom", hydratable: true };
  const { js, css } = compiler.compile(text, options);
  return { js: js.code, css: css.code };
};
