import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/voby": dependencies["@primate/voby"],
    voby: dependencies.voby,
  },
  imports: {
    voby: "@primate/voby",
  },
  modules: {
    voby: "",
  },
});
