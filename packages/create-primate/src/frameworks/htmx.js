import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
  },
  imports: {
    "{htmx}": "@primate/frontend",
  },
  modules: {
    htmx: "",
  },
});
