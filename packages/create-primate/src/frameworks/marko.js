import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
    "@marko/compiler": dependencies["@marko/compiler"],
    "@marko/translator-default": dependencies["@marko/translator-default"],
  },
  imports: {
    "{ marko }": "@primate/frontend",
  },
  modules: {
    marko: "",
  },
});
