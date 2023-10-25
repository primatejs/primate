import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
    "htmx.org": dependencies["htmx.org"],
  },
  imports: {
    "{htmx}": "@primate/frontend",
  },
  modules: {
    htmx: "",
  },
});
