import handlebars from "handlebars";

export const server = text => `export default ${handlebars.precompile(text)};`;
