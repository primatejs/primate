import bye from "#bye";
import type { PrimateConfiguration } from "#config";
import config from "#config";
import config_filename from "#config-filename";
import empty_config_file from "#error/empty-config-file";
import error_in_config_file from "#error/error-in-config-file";
import { PrimateError } from "#log";
import type Mode from "#Mode";
import type FileRef from "@rcompat/fs/FileRef";
import root from "@rcompat/package/root";
import empty from "@rcompat/record/empty";
import override from "@rcompat/record/override";
import runtime from "@rcompat/runtime";
import init from "../shared/hook/init.js";
import app from "./app.js";
import build from "./hook/build.js";

const empty_config = (config?: PrimateConfiguration) => 
  config === undefined || empty(config);

const get_config = async (project_root: FileRef) => {
  const local_config = project_root.join(config_filename);
  const exists = await local_config.exists();
  if (exists) {
    try {
      const imported = await local_config.import("default");

      if (empty_config(imported)) {
        empty_config_file(local_config.toString());
      }

      return imported;
    } catch (error) {
      const primate_error = error as PrimateError;
      if (primate_error.level === "error") {
        error_in_config_file(primate_error.message, `${runtime} ${local_config}`);
      } else {
        throw error;
      }
    }
  }
  return config;
};

export default async (mode: Mode, target: string) => {
  try {
    const package_root = await root();
    const app_config = override(config, await get_config(package_root));
    const $app = await app(package_root, app_config, mode);
    await build(await init($app), target);
    return true;
  } catch (error) {
    if ((error as PrimateError).level === "error") {
      bye();
      return;
    }
    throw error;
  }
};
