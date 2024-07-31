import * as hooks from "./hook/exports.js";

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];
const load = (modules = []) => modules.map(module =>
  [module, load(module.load?.() ?? [])]).flat();

export default async (root, modules) => {
  // collect modules
  const loaded = load(modules).flat(2);

  return {
    names: loaded.map(module => module.name),
    ...Object.fromEntries([...Object.keys(hooks), "context"]
      .map(hook => [hook, filter(hook, loaded)])),
  };
};
