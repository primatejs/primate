import map from "@rcompat/object/map";
import dependencies from "./dependencies.js";
import * as drivers from "./drivers/exports.js";
import link from "./link.js";
import { confirm, select } from "./prompts.js";

const labels = map({
  memory: "In Memory",
  json: "JSON file",
  sqlite: "SQLite",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
  surrealdb: "SurrealDB",
}, ([key, label]) => [key,
  `${label} ${link(`drivers#${label.toLowerCase().replaceAll(" ", "-")}`)}`]);

const example_store = `import primary from "@primate/schema/primary";

export default {
  id: primary,
};
`;

export default async root => {
  await root.join("stores").create();
  await root.join("stores", "Example.js").write(example_store);

  const driver = await (await select({
    message: "Choose driver",
    options: Object.entries(labels).map(([key, label]) =>
      ({ value: drivers[key], label })),
  }))();

  const strict = await confirm({
    message: `Turn strict validation on? ${link("store#strict")}`,
    initialValue: true,
  });

  const schema = await confirm({
    message: `Add Primate Schema for runtime validation? ${link("schema")}`,
  }) ? {
    dependencies: {
      "@primate/schema": dependencies["@primate/schema"],
    },
    imports: {},
    modules: {},
  } : {};

  return {
    dependencies: {
      "@primate/store": dependencies["@primate/store"],
      ...driver.dependencies,
      ...schema.dependencies,
    },
    imports: {
      store: "@primate/store",
      ...driver.imports,
      ...schema.imports,
    },
    modules: {
      store: `{\n      strict: ${strict},\n    ${
        driver.driver ? `  driver: ${driver.driver.name}({${Object
          .entries(driver.driver.options).map(([name, option]) =>
            `\n        ${name}: ${typeof option === "number"
              ? option : `"${option}"`}`).join(",")},\n      }),\n    `
          : ""
      }}`,
      ...schema.modules,
    },
  };
};
