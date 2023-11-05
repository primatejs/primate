import { map, to } from "rcompat/object";
import { select, confirm } from "./prompts.js";
import * as drivers from "./drivers/exports.js";
import link from "./link.js";
import dependencies from "./dependencies.js";

const labels = map({
  memory: "In Memory",
  json: "JSON file",
  sqlite: "SQLite",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
  surrealdb: "SurrealDB",
}, ([key, label]) => [key,
  `${label} ${link(`drivers#${label.toLowerCase().replaceAll(" ", "-")}`)}`]);

const example_store = `import { primary } from "@primate/types";

export default {
  id: primary,
};
`;

export default async root => {
  await root.join("stores").file.create();
  await root.join("stores", "Example.js").file.write(example_store);

  const driver = await (await select({
    message: "Choose driver",
    options: to(labels).map(([key, label]) => ({ value: drivers[key], label })),
  }))();

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
      ...driver.dependencies,
      ...types.dependencies,
    },
    imports: {
      store: "@primate/store",
      ...driver.imports,
      ...types.imports,
    },
    modules: {
      store: `{\n      strict: ${strict},\n    ${
        driver.driver ? `  driver: ${driver.driver.name}({${Object
          .entries(driver.driver.options).map(([name, option]) =>
            `\n        ${name}: ${typeof option === "number"
              ? option : `"${option}"`}`).join(",")},\n      }),\n    `
          : ""
      }}`,
      ...types.modules,
    },
  };
};
