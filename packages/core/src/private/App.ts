import type { Config } from "#config";
import module_loader from "#module-loader";
import { RouteFunction } from "#serve";
import FileRef from "@rcompat/fs/FileRef";
import type Dictionary from "@rcompat/record/Dictionary";
import get from "@rcompat/record/get";
import type { MaybePromise } from "pema/MaybePromise";

export type TargetHandler = (app: App) => MaybePromise<void>;
export type BindFn = (directory: FileRef, file: FileRef) => MaybePromise<undefined>;

type App = Dictionary & {
  path: Record<string, FileRef>;
  root: FileRef;
  get: <T>(key: symbol) => T;
  set: (key: symbol, value: unknown) => void;
  config: <P extends string>(path: P) => ReturnType<typeof get<Config, P>>;
  importmaps: Dictionary;
  error: {
    default?: RouteFunction,
  },
  modules: Awaited<ReturnType<typeof module_loader>>;
  fonts: unknown[];
  runpath: (...directories: string[]) => FileRef;
  bind: (extension: string, handler: BindFn) => undefined;
  target: (name: string, target: TargetHandler) => undefined;
};

export { App as default };
