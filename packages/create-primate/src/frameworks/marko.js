import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/marko": dependencies["@primate/marko"],
    "@marko/compiler": dependencies["@marko/compiler"],
    "@marko/translator-default": dependencies["@marko/translator-default"],
  },
  imports: {
    marko: "@primate/marko",
  },
  modules: {
    marko: "",
  },
});
