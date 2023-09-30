import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
  },
  imports: {
    "{vue}": "@primate/frontend",
  },
  modules: {
    vue: "",
  },
});
