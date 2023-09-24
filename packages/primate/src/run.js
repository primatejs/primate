import { tryreturn } from "runtime-compat/async";
import { Path } from "runtime-compat/fs";
import { extend } from "runtime-compat/object";
import app from "./app.js";
import { default as Logger, bye } from "./Logger.js";
import errors from "./errors.js";
import command from "./commands/exports.js";
import defaults from "./defaults/primate.config.js";

let logger = new Logger({ level: Logger.Warn });
const { runtime = "node" } = import.meta;

const get_config = async root => {
  const name = "primate.config.js";
  const config = root.join(name);
  return await config.exists
    ? tryreturn(async _ => {
      const imported = (await import(config)).default;

      (imported === undefined || Object.keys(imported).length === 0) &&
        errors.EmptyConfigFile.warn(logger, config);

      return extend(defaults, imported);
    }).orelse(({ message }) =>
      errors.ErrorInConfigFile.throw(message, `${runtime} ${config}`))
    : defaults;
};

export default async name => tryreturn(async _ => {
  // use module root if possible, fall back to current directory
  const root = await tryreturn(_ => Path.root()).orelse(_ => Path.resolve());
  const config = await get_config(root);
  logger = new Logger(config.logger);
  await command(name)(await app(logger, root, config));
}).orelse(error => {
  if (error.level === Logger.Error) {
    logger.auto(error);
    return bye();
  }
  throw error;
});
