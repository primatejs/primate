export default {
  server(text) {
    return `import { HTML } from "rcompat/string";
      export default (props, options) => {
      const encoded = JSON.parse(HTML.escape(JSON.stringify(props)));
      const keys = Object.keys(encoded);
      const values = Object.values(encoded);
      const text = ${JSON.stringify(text)};
      return new Function(...keys, \`return \\\`\${text}\\\`;\`)(...values);
    }`;
  },
};
