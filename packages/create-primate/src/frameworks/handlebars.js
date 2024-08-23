import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/handlebars": dependencies["@primate/handlebars"],
    handlebars: dependencies.handlebars,
  },
  imports: {
    handlebars: "@primate/handlebars",
  },
  modules: {
    handlebars: "",
  },
});
