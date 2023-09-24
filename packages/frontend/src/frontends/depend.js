import { tryreturn } from "runtime-compat/async";
import { to } from "runtime-compat/object";
import { packager } from "runtime-compat/meta";
import errors from "../errors.js";

const { MissingDependencies } = errors;
const MODULE_NOT_FOUND = "ERR_MODULE_NOT_FOUND";

export default async (dependencies, from) => {
  const modules = Object.keys(dependencies);

  const results = await Promise.all(modules.map(module =>
    tryreturn(_ => import(module))
      .orelse(({ code }) => code === MODULE_NOT_FOUND ? module : {})));

  const errored = results.filter(result => typeof result === "string");
  const versions = to(dependencies)
    .filter(([dependency]) => errored.includes(dependency))
    .map(([key, value]) => `${key}@${value}`);
  if (errored.length > 0) {
    const install = module => `${packager} install ${module.join(" ")}`;
    MissingDependencies.throw(errored.join(", "), from, install(versions));
  }
  return results.filter(result => typeof result !== "string");
};
