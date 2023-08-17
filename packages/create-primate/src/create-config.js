import {gitignore, package_json, primate_config_js} from "./files/exports.js";

const filter = (configs, property) =>
  configs.filter(conf => conf[property] !== undefined).reduce((acc, conf) =>
    ({...acc, ...conf[property]}), undefined) ?? {};

export default async ([root, configs]) => {
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
