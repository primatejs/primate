import {blue} from "runtime-compat/colors";
import {intro, outro} from "@clack/prompts";

import run from "../run.js";
import {Bailout} from "../prompts.js";
import {gitignore, package_json, primate_config_js} from "../files/exports.js";

const filter = (configs, property) =>
  configs.filter(conf => conf[property] !== undefined).reduce((acc, conf) =>
    ({...acc, ...conf[property]}), undefined) ?? {};

const create = async ([root, configs]) => {
  const config = {
    imports: filter(configs, "imports"),
    dependencies: filter(configs, "dependencies"),
    modules: filter(configs, "modules"),
    config: filter(configs, "config"),
  };

  await gitignore(root, config);
  await package_json(root, config);
  await primate_config_js(root, config);
};

export default async () => {
  intro("Creating a Primate app");
  try {
    await create(await run());
    outro(blue("done, run `npm i && npx primate` to start"));
  } catch (error) {
    if (error instanceof Bailout) {
      outro("bye");
    } else {
      throw error;
    }
  }
};
