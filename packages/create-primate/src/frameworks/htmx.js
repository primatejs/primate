import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/htmx": dependencies["@primate/htmx"],
  },
  imports: {
    htmx: "@primatejs/htmx",
  },
  modules: {
    htmx: "",
  },
});
