import {Path} from "runtime-compat/fs";
import app from "./app.js";
import command from "./commands/exports.js";
import {Abort, colors, print, default as Logger} from "./Logger.js";
import defaults from "./defaults/primate.config.js";
import extend from "./extend.js";

const getRoot = async () => {
  try {
    // use module root if possible
    return await Path.root();
  } catch (error) {
    // fall back to current directory
    return Path.resolve();
  }
};

const configName = "primate.config.js";
const getConfig = async root => {
  const config = root.join(configName);
  if (await config.exists) {
    try {
      const imported = await import(config);
      if (imported.default === undefined) {
        print(`${colors.yellow("??")} ${configName} has no default export\n`);
      }
      return extend(defaults, imported.default);
    } catch (error) {
      print(`${colors.red("!!")} couldn't load config file\n`);
      throw error;
    }
  } else {
    return defaults;
  }
};

export default async name => {
  const root = await getRoot();
  const config = await getConfig(root);
  try {
    command(name)(await app(config, root, new Logger(config.logger)));
  } catch (error) {
    if (error instanceof Abort) {
      throw error;
    }
  }
};
