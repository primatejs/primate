import { Logger } from "primate";

const errors = {
  ErrorInComponent: {
    message: "error in component {0}",
    fix: "fix previous error in {1}",
    level: "Error",
  },
  MissingComponent: {
    message: "missing component {0}",
    fix: "create {1} or remove route function",
    level: "Error",
  },
};

export default Logger.err(errors, "@primate/frontend");
