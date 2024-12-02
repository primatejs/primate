import config_filename from "#config-filename";
import error_double_module from "#error/double-module";
//import error_module_no_name from "#error/module-no-name";
//import error_modules_array from "#error/modules-array";
import type { FileRef } from "@rcompat/fs/file";
import * as hooks from "./hooks.js";
import App from "#BaseApp";
import type { RequestFacade } from "#serve";
import type { MaybePromise } from "pema/MaybePromise";

type Hook<I, O = I> = (t: I, next?: Hook<I, O>) => MaybePromise<O | void>;
type NextHook<I, O = I> = (t: I, next: Hook<I, O>) => MaybePromise<O | void>;
type AppHook = Hook<App>;

export type RequestHook = Hook<RequestFacade, Response>;
export type NextRequestHook = NextHook<RequestFacade, Response>;

type Hooks = {
  init: AppHook,
  build: AppHook,
  context: AppHook,
  serve: AppHook,
  route: RequestHook,
  handle: RequestHook,
};

export type Module = { name: string, load?: () => [] } &
  { [Property in keyof Hooks]?: Hooks[Property]; };

type LoadedHooks = 
  { names: string[] } &
  { [Property in keyof Hooks]?: Hooks[Property][]; };

const doubled = (set: string[]) =>
  set.find((part: string, i: number, array: string[]) =>
    array.filter((_, j) => i !== j).includes(part)) ?? "";
const filter = (key: keyof Module, array?: Module[]) =>
  array?.flatMap(m => m[key] ?? []) ?? [];
const load = (modules: Module[] = []): Module[] => modules.map(module =>
  [module, ...load(module.load?.() ?? [])]).flat();

export default async (root: FileRef, modules: Module[]): Promise<LoadedHooks> => {
  // remove errors for the benefit of a general config file schema validation
  /*if (!Array.isArray(modules)) {
    error_modules_array("modules");
  }

  modules.some(({ name }, n) => !!name  && error_module_no_name(n));
*/
  const names = modules.map(({ name }) => name);
  if(new Set(names).size !== modules.length) {
    error_double_module(doubled(names), root.join(config_filename).toString());
  }
  // collect modules
  const loaded = load(modules).flat(2);

  return {
    names: loaded.map(module => module.name),
    ...Object.fromEntries([...Object.keys(hooks), "context"]
      .map(hook => [hook, filter(hook as keyof Module, loaded)])),
  };
};
