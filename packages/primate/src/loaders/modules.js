import * as e from "primate/errors";
import * as hooks from "../hooks/exports.js";
import { doubled } from "./common.js";

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const load = (modules = []) => modules.map(module =>
  [module, load(module.load?.() ?? [])]).flat();

export default async (log, root, modules) => {
  Array.isArray(modules) || e.ModulesArray.throw("modules");

  modules.some(({ name }, n) => name === undefined && e.ModuleNoName.throw(n));

  const names = modules.map(({ name }) => name);
  new Set(names).size !== modules.length &&
    e.DoubleModule.throw(doubled(names), root.join("primate.config.js"));

  const hookless = modules.filter(module => !Object.keys(module).some(key =>
    [...Object.keys(hooks), "load", "context"].includes(key)));
  hookless.length > 0 && e.ModuleNoHooks.warn(log,
    hookless.map(({ name }) => name).join(", "));

  // collect modules
  const loaded = load(modules).flat(2);

  return {
    names: loaded.map(module => module.name),
    ...Object.fromEntries([...Object.keys(hooks), "context"]
      .map(hook => [hook, filter(hook, loaded)])),
  };
};
