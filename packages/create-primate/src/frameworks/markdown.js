import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
    marked: dependencies.marked,
  },
  imports: {
    "{markdown}": "@primate/frontend",
  },
  modules: {
    markdown: "",
  },
});
