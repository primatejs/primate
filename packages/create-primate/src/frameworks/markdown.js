import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
  },
  imports: {
    "{markdown}": "@primate/frontend",
  },
  modules: {
    markdown: "",
  },
});
