import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/react": dependencies["@primate/react"],
  },
  imports: {
    react: "@primatejs/react",
  },
  modules: {
    react: "",
  },
});