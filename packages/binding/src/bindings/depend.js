import * as P from "rcompat/package";
import errors from "../errors.js";

const semver_regexp = /^\^?(?<integer>\d+)\.?(?<float>.*)$/gu;
const semnum = version => {
  const { integer, float = 0 } = [...version.matchAll(semver_regexp)][0].groups;
  return Number(integer) + Number(float) * 0.1;
};

// this isn't a complete semver comparison, but should work for most cases
const semver = (target, is) => semnum(is) >= semnum(target);

const compare_dependencies = (target, current) =>
  Object.entries(target).filter(([key, value]) => !semver(value, current[key]));

const find_dependencies = (target, current) =>
  Object.entries(target).filter(([key]) => !current[key]);

const { MissingDependencies, UpgradeDependencies } = errors;

export default async (target_dependencies, from) => {
  const { dependencies } = await P.manifest();

  const versions = find_dependencies(target_dependencies, dependencies);
  if (versions.length > 0) {
    const keys = versions.map(([key]) => key);
    const to_upgrade = versions.map(([key, value]) => `${key}@${value}`);
    const install = `${packager()} install ${to_upgrade.join(" ")}`;
    MissingDependencies.throw(keys.join(", "), from, install);
  }

  const upgradeable = compare_dependencies(target_dependencies, dependencies);
  if (upgradeable.length > 0) {
    const keys = upgradeable.map(([key]) => key);
    const to_upgrade = upgradeable.map(([key, value]) => `${key}@${value}`);
    const install = `${packager()} install ${to_upgrade.join(" ")}`;
    UpgradeDependencies.throw(keys.join(", "), from, install);
  }
};
