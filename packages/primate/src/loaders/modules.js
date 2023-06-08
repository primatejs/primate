import * as hooks from "../hooks/exports.js";
import {doubled} from "./common.js";
import errors from "../errors.js";

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const load = (app, modules = []) => {
  return modules.map(module =>
    [module, load(app, module.load?.(app) ?? [])]
  ).flat();
};

export default async (app, root, config) => {
  const modules = config.modules ?? [];

  Array.isArray(modules) || errors.ModulesMustBeArray.throw("modules");

  modules.some((module, n) => module.name === undefined &&
    errors.ModuleHasNoName.throw(n));

  const names = modules.map(({name}) => name);
  new Set(names).size !== modules.length &&
    errors.DoubleModule.throw(doubled(names), root.join("primate.config.js"));

  const hookless = modules.filter(module => !Object.keys(module).some(key =>
    [...Object.keys(hooks), "load", "init"].includes(key)));
  hookless.length > 0 && errors.ModuleHasNoHooks.warn(app.log,
    hookless.map(({name}) => name).join(", "));

  // collect modules
  const loaded = load(app, modules).flat(2);

  // initialize modules
  await Promise.all(loaded
    .filter(module => module.init !== undefined)
    .map(module => module.init(app)));

  return Object.fromEntries(Object.keys(hooks)
    .map(hook => [hook, filter(hook, loaded)]));
};
