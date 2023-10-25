import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
    react: dependencies.react,
    "react-dom": dependencies["react-dom"],
    esbuild: dependencies.esbuild,
  },
  imports: {
    "{react}": "@primate/frontend",
  },
  modules: {
    react: "",
  },
});
