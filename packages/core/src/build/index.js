import bye from "#bye";
import config from "#config";
import config_filename from "#config-filename";
import empty_config_file from "#error/empty-config-file";
import error_in_config_file from "#error/error-in-config-file";
import tryreturn from "@rcompat/async/tryreturn";
import empty from "@rcompat/object/empty";
import override from "@rcompat/object/override";
import root from "@rcompat/package/root";
import platform from "@rcompat/platform";
import app from "./app.js";
import { build, init } from "./hook/exports.js";

const empty_config = config => config === undefined || empty(config);

const get_config = async project_root => {
  const local_config = project_root.join(config_filename);
  const exists = await local_config.exists();
  if (exists) {
    try {
      const imported = await local_config.import("default");

      empty_config(imported) && empty_config_file(local_config);

      return imported;
    } catch (error) {
      if (error.level === undefined) {
        error_in_config_file(error.message, `${platform} ${local_config}`);
      } else {
        throw error;
      }
    }
  }
  return config;
};

export default async (mode, target) => tryreturn(async _ => {
  const package_root = await root();
  const app_config = override(config, await get_config(package_root));
  const $app = await app(package_root, app_config);
  await build(await init($app), mode, target);
  return true;
}).orelse(error => {
  if (error.level === "error") {
    bye();
    return;
  }
  throw error;
});
