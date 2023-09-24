import { module } from "../common/exports.js";

export default await module({
  name: "react",
  dependencies: ["react", "react-dom", "esbuild"],
  default_extension: "jsx",
});
