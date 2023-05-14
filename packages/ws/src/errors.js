import {Logger} from "primate";

export default Object.fromEntries(Object.entries({
  InvalidHandler() {
    return {
      message: ["% route must return a valid % handler", "ws", "message"],
      fix: ["return object that handles the message event, such as %",
        "{message(payload) { return payload; }}"],
      level: Logger.Error,
    };
  },
}).map(([name, error]) =>
  [name, Logger.throwable(error, name, "primate/ws")]));
