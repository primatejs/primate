import { tryreturn } from "rcompat/async";
import FS from "rcompat/fs";
import o from "rcompat/object";
import { runtime } from "rcompat/meta";
import app from "./app.js";
import { default as Logger, bye } from "./Logger.js";
import errors from "./errors.js";
import command from "./commands/exports.js";
import defaults from "./defaults/primate.config.js";

let logger = new Logger({ level: Logger.Warn });

const get_config = async root => {
  const name = "primate.config.js";
  const config = root.join(name);
  return await config.exists()
    ? tryreturn(async _ => {
      const imported = await config.import("default");

      (imported === undefined || Object.keys(imported).length === 0) &&
        errors.EmptyConfigFile.warn(logger, config);

      return o.extend(defaults, imported);
    }).orelse(({ message }) =>
      errors.ErrorInConfigFile.throw(message, `${runtime} ${config}`))
    : defaults;
};

export default async name => tryreturn(async _ => {
  // use module root if possible, fall back to current directory
  const root = await tryreturn(_ => FS.File.root())
    .orelse(_ => FS.File.resolve());
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
