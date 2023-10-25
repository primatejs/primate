import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
    vue: dependencies.vue,
  },
  imports: {
    "{vue}": "@primate/frontend",
  },
  modules: {
    vue: "",
  },
});
