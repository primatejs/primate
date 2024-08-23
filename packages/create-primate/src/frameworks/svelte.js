import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/svelte": dependencies["@primate/svelte"],
    svelte: dependencies.svelte,
  },
  imports: {
    svelte: "@primate/svelte",
  },
  modules: {
    svelte: "",
  },
});
