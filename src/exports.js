import {serve} from "./commands/exports.js";
import run from "./run.js";

export * from "./handlers/exports.js";
export default () => run(serve);
