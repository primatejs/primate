import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
    svelte: dependencies.svelte,
  },
  imports: {
    "{ svelte }": "@primate/frontend",
  },
  modules: {
    svelte: "",
  },
});
