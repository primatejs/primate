import {Logger} from "primate";

export default Object.fromEntries(Object.entries({
  EmptyGuardDirectory({root}) {
    return {
      message: ["empty guard directory"],
      fix: ["populate % with guards or remove it", root],
      level: Logger.Warn,
    };
  },
  InvalidGuard({name}) {
    return {
      message: ["guard % is invalid" , name],
      fix: ["guards must be a function"],
      level: Logger.Error,
    };
  },
  MissingGuardDirectory({root}) {
    return {
      message: ["missing guard directory"],
      fix: ["create % and populate it", root],
      level: Logger.Warn,
    };
  },
}).map(([name, error]) =>
  [name, Logger.throwable(error, name, "primate/guard")]));
