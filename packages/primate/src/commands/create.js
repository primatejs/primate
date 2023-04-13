import {Path} from "runtime-compat/fs";

const createModule = async app => {
  const space = 2;
  try {
    // will throw if cannot find a package.json up the filesystem hierarchy
    await Path.root();
  } catch (error) {
    const rootConfig = JSON.stringify({
      name: "primate-app",
      private: true,
      dependencies: {
        primate: `^${app.version}`,
      },
      scripts: {
        start: "npx primate",
        dev: "npx primate dev",
        serve: "npx primate serve",
      },
      type: "module",
    }, null, space);
    await Path.resolve().join("package.json").file.write(rootConfig);
  }
};

const createConfig = async app => {
  const name = "primate.config.js";
  const template = "export default {};";
  const root = (await Path.root()).join(name);
  if (await root.exists) {
    app.log.warn(`${root} already exists`);
  } else {
    await root.file.write(template);
    app.log.info(`created config at ${root}`);
  }
};

export default async app => {
  await createModule(app);
  await createConfig(app);
};

