import { Logger } from "primate";

const json = {
  MissingDependencies: {
    message: "cannot find {0} (imported from {1})",
    fix: "install dependencies by issuing {2}",
    level: "Error",
  },
};

export default Logger.err(json, "primate/frontend");
