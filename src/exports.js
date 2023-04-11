import run from "./run.js";

export * from "./handlers/exports.js";
export {default as Logger} from "./Logger.js";
export default command => run(command);
