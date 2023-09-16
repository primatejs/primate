import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
  },
  imports: {
    svelte: "@primate/frontend",
  },
  modules: {
    svelte: "",
  },
});
