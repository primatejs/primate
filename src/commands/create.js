import {Path} from "runtime-compat/fs";

const createModule = async env => {
  const space = 2;
  try {
    // will throw if cannot find a package.json up the filesystem hierarchy
    await Path.root();
  } catch (error) {
    const rootConfig = JSON.stringify({
      name: "primate-app",
      private: true,
      dependencies: {
        primate: `^${env.version}`,
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

const createConfig = async env => {
  const name = "primate.config.js";
  const template = "export default {};";
  const root = (await Path.root()).join(name);
  if (await root.exists) {
    env.log.warn(`${root} already exists`);
  } else {
    await root.file.write(template);
    env.log.info(`created config at ${root}`);
  }
};

export default async env => {
  await createModule(env);
  await createConfig(env);
};

