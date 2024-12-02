import type Asset from "#asset";
import type { PrimateConfiguration } from "#config";
import defaults from "#config";
import type { Mode } from "#mode";
import type Import from "@rcompat/module/import";
import override from "@rcompat/object/override";
import app from "./app.js";
import init from "./hook/init.js";
import serve from "./hook/serve.js";

export type Options = {
  config: PrimateConfiguration,
  files: Record<string, unknown>,
  components?: [string, Import][],
  mode: Mode,
  target: string,
  loader: typeof import("primate/loader"),
  assets: Asset[],
}

export default async (root: string, { config, ...options }: Options) => serve(
  await init(
    await app(root, { config: override(defaults, config), ...options }),
  ));
