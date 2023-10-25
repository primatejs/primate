import { blue } from "runtime-compat/colors";
import { Path } from "runtime-compat/fs";
import { intro, outro } from "@clack/prompts";

import run from "../run.js";
import { Bailout } from "../prompts.js";
import * as files from "../files/exports.js";

const filter = (configs, property) =>
  configs.filter(conf => conf[property] !== undefined).reduce((acc, conf) =>
    ({ ...acc, ...conf[property] }), undefined) ?? {};

const create = async ([root, configs]) => {
  const config = {
    imports: filter(configs, "imports"),
    dependencies: filter(configs, "dependencies"),
    modules: filter(configs, "modules"),
    config: filter(configs, "config"),
  };

  await files.gitignore(root, config);
  await files.package_json(root, config);
  await files.primate_config_js(root, config);
  await root.join("pages").file.create();
  await files.app_html(root);
  await files.error_html(root);

  return root;
};

export default async () => {
  intro("Creating a Primate app");
  try {
    const root = await create(await run());
    const cd = Path.same(root, Path.resolve()) ? "" : `cd ${root} && `;
    outro(blue(`done, run \`${cd}npm i && npx primate\` to start`));
  } catch (error) {
    if (error instanceof Bailout) {
      outro("bye");
    } else {
      throw error;
    }
  }
};
