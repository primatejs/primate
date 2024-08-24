import { text } from "../prompts.js";
import dependencies from "../dependencies.js";

export default async () => {
  const database = await text({
    message: "Enter database file path",
    validate: value => value.length === 0 ? "Path required" : undefined,
  });

  return {
    dependencies: {
      "@primate/sqlite": dependencies["@primate/sqlite"],
    },
    imports: {
     sqlite: "@primate/sqlite",
    },
    driver: {
      name: "sqlite",
      options: { database },
    },
  };
};

