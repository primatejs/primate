import dependencies from "./dependencies.js";

const space = 2;

const filter = (confs, property) =>
  confs.filter(conf => conf[property] !== undefined).reduce((acc, conf) =>
    ({...acc, ...conf[property]}), undefined) ?? {};

export default async ([root, confs]) => {
  const conf = {
    imports: filter(confs, "imports"),
    dependencies: filter(confs, "dependencies"),
    modules: filter(confs, "modules"),
    conf: filter(confs, "conf"),
  };

  // create package.json
  const rootConfig = {
    name: "primate-app",
    private: true,
    dependencies: {
      primate: dependencies.primate,
      ...conf.dependencies,
    },
    scripts: {
      start: "npx primate",
      dev: "npx primate dev",
      serve: "npx primate serve",
    },
    type: "module",
  };

  await root.join("package.json").file
    .write(JSON.stringify(rootConfig, undefined, space));

  const imports = Object.entries(conf.imports).map(([name, identifier]) =>
    `import ${name} from "${identifier}";`).join("\n");

  const modules = Object.entries(conf.modules)
    .map(([name, options]) => `\n    ${name}(${options})`).join(",");

  const extras = Object.entries(conf.conf ?? {})
    .map(([name, value]) => `\n  ${name}: ${value}`).join(",");

  const imports_str = imports.length > 0 ? `${imports}\n\n` : "";
  const premod = "\n  modules: [";
  const postmod = ",\n  ],\n";
  const modules_str = modules.length > 0 ? `${premod}${modules}${postmod}` : "";
  const extras_str = extras.length > 0 ? `${extras}\n` : "";

  const config = `${imports_str}export default {${modules_str}${extras_str}};`;
  await root.join("primate.config.js").file.write(config);
};
