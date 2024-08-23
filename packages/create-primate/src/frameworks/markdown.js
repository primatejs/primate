import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/markdown": dependencies["@primate/markdown"],
    marked: dependencies.marked,
  },
  imports: {
    markdown: "@primate/markdown",
  },
  modules: {
    markdown: "",
  },
});
