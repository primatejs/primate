import dependencies from "./dependencies.js";

const filter = (configs, property) =>
  configs.filter(conf => conf[property] !== undefined).reduce((acc, conf) =>
    ({...acc, ...conf[property]}), undefined) ?? {};

const space = 2;
const stringify = contents => JSON.stringify(contents, undefined, space);

const ifn0 = ({length}, out) => length > 0 ? out : "";

const write = {
  package: {
    async json(root, config) {
      const contents = {
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

      await root.join("package.json").file.write(stringify(contents));
    },
  },
  primate: {
    async config(root, config) {
      const imports = Object.entries(config.imports).map(([name, identifier]) =>
        `import ${name} from "${identifier}";`).join("\n");

      const modules = Object.entries(config.modules)
        .map(([name, options]) => `\n    ${name}(${options})`).join(",");

      const extras = Object.entries(config.config ?? {})
        .map(([name, value]) => `\n  ${name}: ${value}`).join(",");

      const $ = {
        imports: ifn0(imports, `${imports}\n\n`),
        modules: ifn0(modules, `\n  modules: [${modules},\n  ],\n`),
        extras: ifn0(extras, `${extras}\n`),
      };

      const contents = `${$.imports}export default {${$.modules}${$.extras}};`;
      await root.join("primate.config.js").file.write(contents);
    },
  },
};

export default async ([root, configs]) => {
  const config = {
    imports: filter(configs, "imports"),
    dependencies: filter(configs, "dependencies"),
    modules: filter(configs, "modules"),
    config: filter(configs, "config"),
  };

  await write.package.json(root, config);
  await write.primate.config(root, config);
};
