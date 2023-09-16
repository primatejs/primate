import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
  },
  imports: {
    handlebars: "@primate/frontend",
  },
  modules: {
    handlebars: "",
  },
});
