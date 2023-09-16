import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
  },
  imports: {
    solid: "@primate/frontend",
  },
  modules: {
    solid: "",
  },
});
