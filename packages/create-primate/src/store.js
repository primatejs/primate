import {select, confirm} from "./prompts.js";
import * as drivers from "./drivers/exports.js";
import link from "./link.js";
import dependencies from "./dependencies.js";
import {map, to} from "runtime-compat/object";

const labels = map({
  memory: "In Memory",
  json: "JSON file",
  sqlite: "SQLite",
  mongodb: "MongoDB",
  postgresql: "PostGreSQL",
  surrealdb: "SurrealDB",
}, ([key, label]) => [drivers[key],
  `${label} ${link(`drivers#${label.toLowerCase().replaceAll(" ", "-")}`)}`]);

export default async () => {
  const driver = await select({
    message: "Choose driver",
    options: to(labels).map(([value, label]) => ({value, label})),
  });

  const conf = await driver();

  const strict = await confirm({
    message: `Turn strict validation on? ${link("store#strict")}`,
    initialValue: true,
  });

  const types = await confirm({
    message: `Install additional runtime types? ${link("types")}`,
  }) ? {
    dependencies: {
      "@primate/types": dependencies["@primate/types"],
    },
    imports: {
      types: "@primate/types",
    },
    modules: {
      types: "",
    },
  } : {};

  return {
    dependencies: {
      "@primate/store": dependencies["@primate/store"],
      ...types.dependencies,
    },
    imports: {
      store: "@primate/store",
      ...conf.imports,
      ...types.imports,
    },
    modules: {
      store: `{\n      strict: ${strict}${
        conf.driver ? `,\n$      driver: ${conf.driver.name}({${Object
          .entries(conf.driver.options).map(([name, option]) =>
            `\n        ${name}: ${typeof option === "number"
              ? option : `"${option}"`}`).join(",")},\n     }}),\n    `
          : ""
      }}`,
      ...types.modules,
    },
  };
};
