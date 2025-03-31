import * as compiler from "svelte/compiler";

export default (text: string) =>
  compiler.compile(text, { generate: "server" }).js.code;
