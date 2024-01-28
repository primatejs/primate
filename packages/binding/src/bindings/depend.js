import { tryreturn } from "rcompat/async";
import { to } from "rcompat/object";
import { packager, manifest } from "rcompat/meta";
import { File } from "rcompat/fs";
import errors from "../errors.js";

// this isn't a complete semver comparison, but should work for most cases
const semver = (target, is) => {
  if (target.startsWith("^")) {
    return semver(Number(target.slice(1), is));
  }
  if (is.startsWith("^")) {
    return semver(target, Number(is.slice(1)));
  }

  return is >= target;
};

const compare_dependencies = (target, current) =>
  to(target).filter(([key, value]) => !semver(value, current[key]));

const find_dependencies = (target, current) =>
  to(target).filter(([key]) => !current[key]);

const { MissingDependencies, UpgradeDependencies } = errors;

export default async (target_dependencies, from) => {
  const { dependencies } = await (await File.root()).join(manifest).json();

  const versions = find_dependencies(target_dependencies, dependencies);
  if (versions.length > 0) {
    const keys = versions.map(([key]) => key);
    const to_upgrade = versions.map(([key, value]) => `${key}@${value}`);
    const install = `${packager} install ${to_upgrade.join(" ")}`;
    MissingDependencies.throw(keys.join(", "), from, install);
  }

  const upgradeable = compare_dependencies(target_dependencies, dependencies);
  if (upgradeable.length > 0) {
    const keys = upgradeable.map(([key]) => key);
    const to_upgrade = upgradeable.map(([key, value]) => `${key}@${value}`);
    const install = `${packager} install ${to_upgrade.join(" ")}`;
    UpgradeDependencies.throw(keys.join(", "), from, install);
  }
};
