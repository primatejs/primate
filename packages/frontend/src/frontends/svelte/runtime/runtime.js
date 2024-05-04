import { runtime } from "../../common/exports.js";
import * as exports from "../client/exports.js";
import * as imports from "./imports.js";

export default runtime({
  name: "svelte",
  dependencies: ["svelte"],
  default_extension: ".svelte",
  imports,
  exports,
});
