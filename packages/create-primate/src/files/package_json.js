import { stringify } from "runtime-compat/object";
import dependencies from "../dependencies.js";

export default async (root, config) => {
  const json = {
    name: "primate-app",
    private: true,
    dependencies: {
      primate: dependencies.primate,
      ...config.dependencies,
    },
    scripts: {
      start: "npx primate",
      dev: "npx primate dev",
      serve: "npx primate serve",
    },
    type: "module",
  };
  const contents = `${stringify(json)}\n`;
  await root.join("package.json").file.write(contents);
};
