import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/htmx": dependencies["@primate/htmx"],
    "htmx.org": dependencies["htmx.org"],
  },
  imports: {
    htmx: "@primate/htmx",
  },
  modules: {
    htmx: "",
  },
});
