import { marked } from "marked";

const server = text => `export default () => ${JSON.stringify(text)};`;

export default options => ({
  async server(text) {
    const renderer = { ...options?.renderer ?? {} };
    marked.use({ ...options, renderer });

    return server(await marked.parse(text));
  },
});
