import type { Config } from "#config";
import type module_loader from "#module-loader";
import type RouteFunction from "#RouteFunction";
import type FileRef from "@rcompat/fs/FileRef";
import type Dictionary from "@rcompat/record/Dictionary";
import type get from "@rcompat/record/get";
import type MaybePromise from "pema/MaybePromise";

export type TargetHandler = (app: App) => MaybePromise<void>;
export type BindFn = (directory: FileRef, file: FileRef) => MaybePromise<undefined>;

type App = {
  path: Dictionary<FileRef>;
  root: FileRef;
  get: <T>(key: symbol) => T;
  set: (key: symbol, value: unknown) => void;
  config: <P extends string>(path: P) => ReturnType<typeof get<Config, P>>;
  error: {
    default?: RouteFunction,
  },
  modules: Awaited<ReturnType<typeof module_loader>>;
  runpath: (...directories: string[]) => FileRef;
};

export { App as default };
