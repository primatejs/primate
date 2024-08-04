import * as compiler from "svelte/compiler";

export default text => {
  const options = { generate: "ssr", hydratable: true };
  return compiler.compile(text, options).js.code;
};
