import {Path} from "runtime-compat/fs";
const name = "primate.config.js";

const template = "export default {};";

const createConfig = async env => {
  const root = (await Path.root()).join(name);
  if (await root.exists) {
    env.log.warn(`${root} already exists`);
  } else {
    await root.file.write(template);
    env.log.info(`created config at ${root}`);
  }
};

export default async env => {
  await createConfig(env);
};

