import handlebars from "handlebars";
import runtime from "handlebars/runtime.js";

export const compile = {
  server(text) {
    return `export default ${handlebars.precompile(text)}`;
  },
};

export const render = precompiled => runtime.template(precompiled);
