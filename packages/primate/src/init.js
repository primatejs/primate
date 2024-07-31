import blue from "@rcompat/cli/color/blue";
import bold from "@rcompat/cli/color/bold";
import print from "@rcompat/cli/print";
import manifest from "@rcompat/package/manifest";
import find from "./commands/exports.js";

export default async (...args) => {
  const [command, ...flags] = args;
  const primate = await manifest(import.meta.url);
  print(blue(bold(primate.name)), blue(primate.version), "\n");
  find(command)(...flags);
};
