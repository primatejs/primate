import * as O from "rcompat/object";
import * as P from "rcompat/package";
import { packager } from "rcompat/package";
import errors from "./errors.js";

const { MissingDependencies } = errors;

export default async (library_manifest, desired, from) => {
  const app_dependencies = (await P.manifest()).dependencies;
  const keys = Object.keys(app_dependencies);
  const library_peers = O.filter(library_manifest.peerDependencies,
    ([key]) => desired.includes(key));
  const missing = desired.filter(peer => !keys.includes(peer));

  if (missing.length > 0) {
    const to_install = missing.map(key => `${key}@${library_peers[key]}`);
    const install = `${packager()} install ${to_install.join(" ")}`;
    MissingDependencies.throw(missing.join(", "), from, install);
  }
};
