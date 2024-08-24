import stringify from "@rcompat/object/stringify";
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
      start: "npm run dev",
      build: "primate build",
      serve: "primate serve",
      dev: "primate",
      prod: "npm run build && npm run serve",
    },
    type: "module",
  };
  const contents = `${stringify(json)}\n`;
  await root.join("package.json").write(contents);
};
