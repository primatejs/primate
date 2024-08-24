import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/marko": dependencies["@primate/marko"],
    marko: dependencies.marko,
  },
  imports: {
    marko: "@primate/marko",
  },
  modules: {
    marko: "",
  },
});
