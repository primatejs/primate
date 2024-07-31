import defaults from "#config";
import override from "@rcompat/object/override";
import app from "./app.js";
import { init, serve } from "./hook/exports.js";

export default async (root, { config, ...options }) => serve(
  await init(
    await app(root, { config: override(defaults, config), ...options }),
  ));
