import blue from "@rcompat/cli/color/blue";
import bold from "@rcompat/cli/color/bold";
import print from "@rcompat/cli/print";
import manifest from "@rcompat/package/manifest";
import find from "./commands/index.js";

export default async (...args: string[]) => {
  const [command, ...flags] = args;
  const primate = await manifest(import.meta.url);
  print(blue(bold(primate.name as string)), blue(primate.version as string), "\n");
  find(command)(...flags);
};
