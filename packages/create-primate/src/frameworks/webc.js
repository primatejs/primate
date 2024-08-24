import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/webc": dependencies["@primate/webc"],
  },
  imports: {
    webc: "@primate/webc",
  },
  modules: {
    webc: "",
  },
});
