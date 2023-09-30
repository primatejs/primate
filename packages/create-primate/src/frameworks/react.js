import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
  },
  imports: {
    "{react}": "@primate/frontend",
  },
  modules: {
    react: "",
  },
});
