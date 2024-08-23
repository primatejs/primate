import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/react": dependencies["@primate/react"],
    react: dependencies.react,
    "react-dom": dependencies["react-dom"],
  },
  imports: {
    react: "@primate/react",
  },
  modules: {
    react: "",
  },
});
