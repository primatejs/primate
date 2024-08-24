#!/usr/bin/env node

import manifest from "@rcompat/package/manifest";
import root from "@rcompat/package/root";
import empty from "@rcompat/record/empty";
import entries from "@rcompat/record/entries";

const packages_base = (await root(import.meta.url)).join("..");
const subpkg = "@primate";

const package_json = await manifest(import.meta.url);

for (const [key] of Object.entries(package_json.devDependencies)) {
  if (!key.startsWith(subpkg)) {
    continue;
  }
  const { peerDependencies } = await packages_base
    .join(key.slice(subpkg.length), "package.json").json();
  if (peerDependencies !== undefined) {
    const peerdeps = entries(peerDependencies)
      .filter(([key]) => key !== "primate" && !key.startsWith("@primate")).get();
    if (!empty(peerdeps)) {
      console.log(peerdeps);
    }
  }
}

