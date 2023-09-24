const ifn0 = ({ length }, out) => length > 0 ? out : "";

export default async (root, config) => {
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

  const contents = `${$.imports}export default {${$.modules}${$.extras}};\n`;
  await root.join("primate.config.js").file.write(contents);
};
