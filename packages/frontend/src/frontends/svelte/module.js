import { module } from "../common/exports.js";
import * as imports from "./imports.js";
import * as exports from "./client/exports.js";

export default await module({
  name: "svelte",
  dependencies: ["svelte"],
  default_extension: ".svelte",
  imports,
  exports,
});
