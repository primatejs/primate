import NoDependencies from "@primate/store/errors/no-dependencies";
import { tryreturn } from "rcompat/async";
import { packager } from "rcompat/package";

export default async (dependencies, from) => {
  const modules = Object.keys(dependencies);

  const results = await Promise.all(modules.map(module =>
    tryreturn(_ => import(module)).orelse(_ => module),
  ));
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
