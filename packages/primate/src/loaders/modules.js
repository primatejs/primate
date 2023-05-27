import * as hooks from "../hooks/exports.js";
import {doubled} from "./common.js";
import errors from "../errors.js";

export default async (app, root, config) => {
  const modules = config.modules === undefined ? [] : config.modules;

  modules.some((module, n) => module.name === undefined &&
    errors.ModulesMustHaveNames.throw(n));

  const names = modules.map(({name}) => name);
  new Set(names).size !== modules.length &&
    errors.DoubleModule.throw(doubled(names), root.join("primate.config.js"));

  const hookless = modules.filter(module => !Object.keys(module).some(key =>
    [...Object.keys(hooks), "load"].includes(key)));
  hookless.length > 0 && errors.ModuleHasNoHooks.warn(app.log,
    hookless.map(({name}) => name).join(", "));

  // modules may load other modules
  await Promise.all(modules
    .filter(module => module.load !== undefined)
    .map(module => module.load({...app, load(dependent) {
      modules.push(dependent);
    }})));

  return modules;
};
