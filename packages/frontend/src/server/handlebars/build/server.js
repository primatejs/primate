import handlebars from "handlebars";

export default text => `export default ${handlebars.precompile(text)};`;
