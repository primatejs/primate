import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/vue": dependencies["@primate/vue"],
  },
  imports: {
    vue: "@primatejs/vue",
  },
  modules: {
    vue: "",
  },
});
