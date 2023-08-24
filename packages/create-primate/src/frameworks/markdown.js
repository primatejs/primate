import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/markdown": dependencies["@primate/markdown"],
  },
  imports: {
    markdown: "@primate/markdown",
  },
  modules: {
    markdown: "",
  },
});
