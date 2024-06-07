import { tryreturn } from "rcompat/async";
import { blue, bold } from "rcompat/colors";
import { File } from "rcompat/fs";
import * as O from "rcompat/object";
import * as P from "rcompat/package";
import { default as Logger, bye, print } from "./Logger.js";
import app from "./app.js";
import find from "./commands/exports.js";
import defaults from "./defaults/primate.config.js";
import errors from "./errors.js";
import { init } from "./hooks/exports.js";

let logger = new Logger({ level: Logger.Warn });
const config_filename = "primate.config.js";

const get_config = async root => {
  const config = root.join(config_filename);
  return await config.exists()
    ? tryreturn(async _ => {
      const imported = await config.import("default");

      O.empty(imported) && errors.EmptyConfigFile.warn(logger, config);

      return O.extend(defaults, imported);
    }).orelse(({ message }) =>
      errors.ErrorInConfigFile.throw(message, `${P.platform()} ${config}`))
    : defaults;
};

export default async (command, params) => tryreturn(async _ => {
  // use module root if possible, fall back to current directory
  const root = await tryreturn(_ => P.root()).orelse(_ => File.resolve());
  const config = await get_config(root);
  logger = new Logger(config.logger);
  const primate = await P.manifest(import.meta.url);
  print(blue(bold(primate.name)), blue(primate.version), "\n");
  await find(command)(await init(await app(logger, root, config)), params);
}).orelse(error => {
  if (error.level === Logger.Error) {
    logger.auto(error);
    return bye();
  }
  throw error;
});
