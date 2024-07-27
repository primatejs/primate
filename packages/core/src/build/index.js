import { tryreturn } from "rcompat/async";
import * as O from "rcompat/object";
import * as P from "rcompat/package";
import { EmptyConfigFile, ErrorInConfigFile } from "@primate/core/errors";
import Logger from "@primate/core/logger";
import defaults from "@primate/core/config";
import app from "./app.js";
import { init, build } from "./hooks/exports.js";
import { bye } from "../shared/Logger.js";

let logger = new Logger({ level: Logger.Warn });
const config_filename = "primate.config.js";

const get_config = async root => {
  const config = root.join(config_filename);
  return await config.exists()
    ? tryreturn(async _ => {
      const imported = await config.import("default");

      O.empty(imported) && EmptyConfigFile.warn(logger, config);

      return imported;
    }).orelse(({ message }) =>
      ErrorInConfigFile.throw(message, `${P.platform()} ${config}`))
    : defaults;
};

export default async (mode, target) => tryreturn(async _ => {
  const root = await P.root();
  const config = O.extend(defaults, await get_config(root));
  logger = new Logger(config.logger);
  const $app = await app(logger, root, config);
  await build(await init($app), mode, target);
  return true;
}).orelse(error => {
  if (error.level === Logger.Error) {
    logger.auto(error);
    bye();
    return;
  }
  throw error;
});
