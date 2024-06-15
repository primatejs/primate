import init from "./init.js";
import serve from "./hooks/serve.js";

export { MediaType, Status } from "rcompat/http";
export { default as Logger } from "./Logger.js";
export * from "./handlers.js";
export default command => init(command);
export { init, serve };
