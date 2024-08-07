import { marked } from "marked";

const compile = text => `export default () => ${JSON.stringify(text)};`;

export default options => async (text) => {
  const renderer = { ...options?.renderer ?? {} };
  marked.use({ ...options, renderer });

  return compile(await marked.parse(text));
};
