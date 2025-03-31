import { compile } from "svelte/compiler";

export default (text: string) => {
  const { js, css } = compile(text, { generate: "client", accessors: true });
  return { js: js.code, css: css?.code ?? null };
};
