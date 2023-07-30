import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/vue": dependencies["@primate/vue"],
  },
  imports: {
    vue: "@primate/vue",
  },
  modules: {
    vue: "",
  },
});
