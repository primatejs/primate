import { compile, type CompileOptions } from "poly/compiler";

export default (text: string): {
  js: string,
  css: string | null,
} => {
  const options = { generate: "dom", hydratable: true } as CompileOptions;
  const { js, css } = compile(text, options);
  return { js: js.code, css: css.code };
};

