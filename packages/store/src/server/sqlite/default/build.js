import depend from "@primate/store/base/depend";
import { dependencies, name } from "@primate/store/sqlite/common";
import { platform } from "rcompat/package";

export default async () => {
  const bun = platform() === "bun";
  if (bun) {
    return;
  }
  await depend(dependencies, name);
};
