import { compile, type CompileOptions } from "poly/compiler";

export default (text: string) => {
  const options = { generate: "ssr", hydratable: true } as CompileOptions;
  return compile(text, options).js.code;
};
