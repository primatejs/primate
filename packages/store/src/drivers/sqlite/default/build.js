import { platform } from "rcompat/package";
import depend from "../../../depend.js";

const dependencies = ["better-sqlite3"];

export default name => async () => {
  const bun = platform() === "bun";
  if (bun) {
    return;
  }
  await depend(dependencies, name);
};
