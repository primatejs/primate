import NoDependencies from "@primate/store/errors/no-dependencies";
import { tryreturn } from "rcompat/async";
import * as O from "rcompat/object";
import { manifest, packager } from "rcompat/package";

const peers = async () =>
  ({ ...(await manifest(import.meta.filename)).peerDependencies });
const MODULE_NOT_FOUND = "ERR_MODULE_NOT_FOUND";

export default async (on, name) => {
  const from = `frontend:${name}`;
  const dependencies = O.filter(await peers(), ([key]) => on.includes(key));
  const modules = Object.keys(dependencies);

  const results = await Promise.all(modules.map(module =>
    tryreturn(_ => import(module))
      .orelse(({ code }) => code === MODULE_NOT_FOUND ? module : {})));

  const errored = results.filter(result => typeof result === "string");
  const versions = Object.entries(dependencies)
    .filter(([dependency]) => errored.includes(dependency))
    .map(([key, value]) => `${key}@${value}`);
  if (errored.length > 0) {
    const install = module => `${packager()} install ${module.join(" ")}`;
    NoDependencies.throw(errored.join(", "), from, install(versions));
  }
  return results.filter(result => typeof result !== "string");
};
