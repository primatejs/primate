import * as compiler from "svelte/compiler";

export default text => {
  const options = { generate: "dom", hydratable: true };
  const { js, css } = compiler.compile(text, options);
  return { js: js.code, css: css.code };
};

