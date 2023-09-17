import {module} from "../common/exports.js";

export default await module({
  name: "solid",
  dependencies: ["solid-js", "@babel/core", "babel-preset-solid"],
  default_extension: "jsx",
});
