import {Path} from "runtime-compat/fs";
import {extend} from "runtime-compat/object";
import app from "./app.js";
import {default as Logger, bye} from "./Logger.js";
import errors from "./errors.js";
import command from "./commands/exports.js";
import defaults from "./defaults/primate.config.js";

const getRoot = async () => {
  try {
    // use module root if possible
    return await Path.root();
  } catch (error) {
    // fall back to current directory
    return Path.resolve();
  }
};

const protologger = new Logger({level: Logger.Warn, trace: true});

const getConfig = async root => {
  const name = "primate.config.js";
  const config = root.join(name);
  if (await config.exists) {
    try {
      const imported = (await import(config)).default;

      (imported === undefined || Object.keys(imported).length === 0) &&
        errors.EmptyConfigFile.warn(protologger, config);

      return extend(defaults, imported);
    } catch ({message}) {
      const {runtime = "node"} = import.meta;
      return errors.ErrorInConfigFile.throw(message, `${runtime} ${config}`);
    }
  } else {
    return defaults;
  }
};

export default async name => {
  try {
    const root = await getRoot();
    const config = await getConfig(root);
    await command(name)(await app(config, root, new Logger(config.logger)));
  } catch (error) {
    if (error.level === Logger.Error) {
      protologger.auto(error);
      bye();
    } else {
      throw error;
    }
  }
};
