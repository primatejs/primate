import config_filename from "#config-filename";
import double_module from "#error/double-module";
import module_no_name from "#error/module-no-name";
import modules_array from "#error/modules-array";
import * as hooks from "./hook/exports.js";

const doubled = set => set.find((part, i, array) =>
  array.filter((_, j) => i !== j).includes(part));
const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];
const load = (modules = []) => modules.map(module =>
  [module, load(module.load?.() ?? [])]).flat();

export default async (root, modules) => {
  !Array.isArray(modules) && modules_array("modules");

  modules.some(({ name }, n) => name === undefined && module_no_name(n));

  const names = modules.map(({ name }) => name);
  new Set(names).size !== modules.length && double_module(
    doubled(names), root.join(config_filename));

  // collect modules
  const loaded = load(modules).flat(2);

  return {
    names: loaded.map(module => module.name),
    ...Object.fromEntries([...Object.keys(hooks), "context"]
      .map(hook => [hook, filter(hook, loaded)])),
  };
};
