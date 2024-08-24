import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/html": dependencies["@primate/html"],
  },
  imports: {
    html: "@primate/html",
  },
  modules: {
    html: "",
  },
});
