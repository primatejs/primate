import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/solid": dependencies["@primate/solid"],
  },
  imports: {
    solid: "@primate/solid",
  },
  modules: {
    solid: "",
  },
});
