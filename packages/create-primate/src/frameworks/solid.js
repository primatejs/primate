import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/frontend": dependencies["@primate/frontend"],
    "solid-js": dependencies["solid-js"],
    "babel-preset-solid": dependencies["babel-preset-solid"],
  },
  imports: {
    "{solid}": "@primate/frontend",
  },
  modules: {
    solid: "",
  },
});
