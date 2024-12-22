import config_filename from "#config-filename";
import error_double_module from "#error/double-module";
//import error_module_no_name from "#error/module-no-name";
//import error_modules_array from "#error/modules-array";
import type { FileRef } from "@rcompat/fs/file";
import * as hooks from "./hook/index.js";
import { PrimateBuildApp } from "./app.js";

type Next = (app: PrimateBuildApp, next: Next) => PrimateBuildApp;

export type PrimateModule = {
  name: string;
  init: Next,
  load?: () => [],
};

const doubled = set => set.find((part, i, array) =>
  array.filter((_, j) => i !== j).includes(part));
const filter = (key: keyof PrimateModule, array?: PrimateModule[]) => 
  array?.flatMap(m => m[key] ?? []) ?? [];
const load = (modules: PrimateModule[] = []): PrimateModule[] => modules.map(module =>
  [module, ...load(module.load?.() ?? [])]).flat();

export default async (root: FileRef, modules: PrimateModule[]) => {
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
      .map(hook => [hook, filter(hook as keyof PrimateModule, loaded)])),
  };
};
