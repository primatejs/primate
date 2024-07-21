import { throwable } from "./Logger.js";

export default ({ message, fix, name, module }) =>
  throwable({ message, fix, level: "Warn" }, name, module);
