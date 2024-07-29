import defaults from "@primate/core/config";
import Logger from "@primate/core/logger";
import override from "@rcompat/object/override";
import app from "./app.js";
import { init, serve } from "./hooks/exports.js";

export default async (root, { config, ...options }) => {
  const config$ = override(defaults, config);
  const logger = new Logger(config$.logger);
  const $app = await app(logger, root, { config: config$, ...options });
  await serve(await init($app));
};
