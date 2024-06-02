import init from "./init.js";

export * from "./handlers.js";

export { default as Logger } from "./Logger.js";

export { Status, MediaType } from "rcompat/http";

export default command => init(command);
