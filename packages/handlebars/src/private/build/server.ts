import handlebars from "handlebars";

export default (text: string) => `export default ${handlebars.precompile(text)};`;
