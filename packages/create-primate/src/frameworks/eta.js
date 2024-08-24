import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/eta": dependencies["@primate/eta"],
    eta: dependencies.eta,
  },
  imports: {
    eta: "@primate/eta",
  },
  modules: {
    eta: "",
  },
});
