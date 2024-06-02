import { tryreturn } from "rcompat/async";
import { bold, blue } from "rcompat/colors";
import { File } from "rcompat/fs";
import * as O from "rcompat/object";
import { resolve } from "rcompat/package";
import { runtime } from "rcompat/meta";
import app from "./app.js";
import { default as Logger, bye, print } from "./Logger.js";
import errors from "./errors.js";
import find from "./commands/exports.js";
import defaults from "./defaults/primate.config.js";
import { init } from "./hooks/exports.js";

let logger = new Logger({ level: Logger.Warn });

const get_config = async root => {
  const name = "primate.config.js";
  const config = root.join(name);
  return await config.exists()
    ? tryreturn(async _ => {
      const imported = await config.import("default");

      (imported === undefined || Object.keys(imported).length === 0) &&
        errors.EmptyConfigFile.warn(logger, config);

      return O.extend(defaults, imported);
    }).orelse(({ message }) =>
      errors.ErrorInConfigFile.throw(message, `${runtime} ${config}`))
    : defaults;
};

export default async (command, params) => tryreturn(async _ => {
  // use module root if possible, fall back to current directory
  const root = await tryreturn(_ => File.root())
    .orelse(_ => File.resolve());
  const config = await get_config(root);
  logger = new Logger(config.logger);
  const primate = await resolve(import.meta.url);
  print(blue(bold(primate.name)), blue(primate.version), "\n");
  await find(command)(await init(await app(logger, root, config)), params);
}).orelse(error => {
  if (error.level === Logger.Error) {
    logger.auto(error);
    return bye();
  }
  throw error;
});
