import defaults from "@primate/core/config";
import { EmptyConfigFile, ErrorInConfigFile } from "@primate/core/errors";
import Logger from "@primate/core/logger";
import tryreturn from "@rcompat/async/tryreturn";
import empty from "@rcompat/object/empty";
import override from "@rcompat/object/override";
import root from "@rcompat/package/root";
import platform from "@rcompat/platform";
import { bye } from "../shared/Logger.js";
import app from "./app.js";
import { build, init } from "./hooks/exports.js";

let logger = new Logger({ level: Logger.Warn });
const config_filename = "primate.config.js";

const get_config = async root => {
  const config = root.join(config_filename);
  return await config.exists()
    ? tryreturn(async _ => {
      const imported = await config.import("default");

      empty(imported) && EmptyConfigFile.warn(logger, config);

      return imported;
    }).orelse(({ message }) =>
      ErrorInConfigFile.throw(message, `${platform} ${config}`))
    : defaults;
};

export default async (mode, target) => tryreturn(async _ => {
  const package_root = await root();
  const config = override(defaults, await get_config(package_root));
  logger = new Logger(config.logger);
  const $app = await app(logger, package_root, config);
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
