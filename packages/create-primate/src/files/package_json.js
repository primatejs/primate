import { stringify } from "rcompat/object";
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
      start: "primate",
      dev: "primate dev",
      serve: "primate serve",
    },
    type: "module",
  };
  const contents = `${stringify(json)}\n`;
  await root.join("package.json").file.write(contents);
};
