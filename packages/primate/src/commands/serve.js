import * as P from "rcompat/package";
import { tryreturn } from "@rcompat/async";
import { resolve } from "@rcompat/fs";

// serve from build directory
export default async (from = "build") => {
  const root = await tryreturn(_ => P.root()).orelse(_ => resolve());
  return root.join(`./${from}/serve.js`).import();
};
