import { FileRef } from "@rcompat/fs/file";
import type { PrimateConfiguration } from "#config";
import get from "@rcompat/object/get";
import module_loader from "#module-loader";
import type { MaybePromise } from "pema/MaybePromise";

type R = Record<string, unknown>;

export type TargetHandler = (app: BaseApp) => MaybePromise<undefined>;
export type BindFn = (directory: FileRef, file: FileRef) => MaybePromise<undefined>;

export default interface BaseApp {
  path: Record<string, FileRef>;
  root: FileRef;
  get: (key: symbol) => unknown;
  set: (key: symbol, value: unknown) => undefined;
  config: <P extends string>(path: P) => ReturnType<typeof get<PrimateConfiguration, P>>;
  importmaps: R;
  error: R;
  modules: Awaited<ReturnType<typeof module_loader>>;
  fonts: unknown[];
  runpath: (...directories: string[]) => FileRef;
  bind: (extension: string, handler: BindFn) => undefined;
  target: (name: string, target: TargetHandler) => undefined;
};
