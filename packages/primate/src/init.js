import find from "./commands/exports.js";
import { blue, bold } from "rcompat/colors";
import * as P from "rcompat/package";
import print from "@primate/core/logger/print";

export default async (...args) => {
  const [command, ...flags] = args;
  const primate = await P.manifest(import.meta.url);
  print(blue(bold(primate.name)), blue(primate.version), "\n");
  find(command)(...flags);
};
