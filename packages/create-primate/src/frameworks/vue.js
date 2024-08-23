import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/vue": dependencies["@primate/vue"],
    vue: dependencies.vue,
  },
  imports: {
    vue: "@primate/vue",
  },
  modules: {
    vue: "",
  },
});
