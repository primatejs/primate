import handlebars from "handlebars";

export default {
  server(text) {
    return `export default ${handlebars.precompile(text)};`;
  },
};
