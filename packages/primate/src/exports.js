import init from "./init.js";

export { MediaType, Status } from "rcompat/http";
export { default as Logger } from "@primate/core/logger";
export default command => init(command);
