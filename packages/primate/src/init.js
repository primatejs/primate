import find from "./commands/exports.js";
import { blue, bold } from "rcompat/colors";
import * as P from "rcompat/package";
import print from "@primate/core/logger/print";

export default async (...args) => {
  const [command, ...flags] = args;
  const primate = await P.manifest(import.meta.url);
  print(blue(bold(primate.name)), blue(primate.version), "\n");
  find(command)(...flags);
};
/*
let logger = new Logger({ level: Logger.Warn });
const config_filename = "primate.config.js";

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
