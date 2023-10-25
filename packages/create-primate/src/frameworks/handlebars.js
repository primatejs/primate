import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
    handlebars: dependencies.handlebars,
  },
  imports: {
    "{handlebars}": "@primate/frontend",
  },
  modules: {
    handlebars: "",
  },
});
