import { marked } from "marked";
import type { MarkedExtension } from "marked";
import maybe from "@rcompat/invariant/maybe";

const compile = (text: string) => `export default () => ${JSON.stringify(text)};`;

export default (options?: MarkedExtension) => async (text: string) => {
  maybe(options).object();

  const renderer = { ...options?.renderer ?? {} };
  marked.use({ ...options, renderer });

  return compile(await marked.parse(text));
};
