import * as compiler from "poly/compiler";

export default text => {
  const options = { generate: "ssr", hydratable: true };
  return compiler.compile(text, options).js.code;
};
