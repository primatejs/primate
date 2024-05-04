import init from "./init.js";

export { MediaType, Status } from "rcompat/http";
export * from "@primate/core/handlers";
export { default as Logger } from "@primate/core/logger";
export default command => init(command);
