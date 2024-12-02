import type Asset from "#asset";
import type { PrimateConfiguration } from "#config";
import defaults from "#config";
import type { Mode } from "#mode";
import type { Route, RouteSpecial } from "#serve";
import Dictionary from "@rcompat/record/Dictionary";
import override from "@rcompat/record/override";
import app from "./app.js";
import init from "../shared/hook/init.js";
import serve from "./hook/serve.js";
import loader from "./loader.js";

type Import = Dictionary & {
    default: unknown;
};

export type BuildFiles = {
  routes: [string, Route | RouteSpecial][],
}

export type Options = {
  config: PrimateConfiguration,
  files: BuildFiles,
  components?: [string, Import][],
  mode: Mode,
  target: string,
  loader: ReturnType<typeof loader>,
  assets: Asset[],
}

export default async (root: string, { config, ...options }: Options) => 
  serve(
    await init(
      await app(root, { config: override(defaults, config), ...options }),
  ));
