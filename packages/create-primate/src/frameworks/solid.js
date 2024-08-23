import dependencies from "../dependencies.js";

export default () => ({
  dependencies: {
    "@primate/solid": dependencies["@primate/solid"],
    "solid-js": dependencies["solid-js"],
    "babel-preset-solid": dependencies["babel-preset-solid"],
  },
  imports: {
    solid: "@primate/solid",
  },
  modules: {
    solid: "",
  },
});
