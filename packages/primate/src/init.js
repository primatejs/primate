import find from "./commands/exports.js";
import { blue, bold } from "rcompat/colors";
import * as P from "rcompat/package";
import { print } from "@primate/core";

export default async (...args) => {
  const [command, ...flags] = args;
  const primate = await P.manifest(import.meta.url);
  print(blue(bold(primate.name)), blue(primate.version), "\n");
  find(command)(...flags);
};
/*import { EmptyConfigFile, ErrorInConfigFile } from "primate/errors";
import { tryreturn } from "rcompat/async";
import { blue, bold } from "rcompat/colors";
import { File } from "rcompat/fs";
import * as O from "rcompat/object";
import * as P from "rcompat/package";
import { default as Logger, bye, print } from "./Logger.js";
import app from "./app.js";
import find from "./commands/exports.js";
import defaults from "./defaults/primate.config.js";
import { init } from "./hooks/exports.js";

let logger = new Logger({ level: Logger.Warn });
const config_filename = "primate.config.js";

// during build, COPY config to $BUILD$
// during serve, load config from $BUILD$/primate.config.js
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

export default async (command, root, config, assets, routes, components) => tryreturn(async _ => {
  console.log("COMMAND", command);
  // use module root if possible, fall back to current directory
  const $root = root ??
    await tryreturn(_ => P.root()).orelse(_ => File.resolve());
  const $config = O.extend(defaults, config ?? await get_config($root));
  logger = new Logger($config.logger);
  // comment out next two for building
  //const primate = await P.manifest(import.meta.url);
  //print(blue(bold(primate.name)), blue(primate.version), "\n");
  await find(command)(await init(await app(logger, $root, $config, assets, routes, components)));
}).orelse(error => {
  if (error.level === Logger.Error) {
    logger.auto(error);
    return bye();
  }
  throw error;
});*/
