import {text} from "../prompts.js";
import dependencies from "../dependencies.js";

export default async () => {
  const filename = await text({
    message: "Enter database file path",
    validate: value => value.length === 0 ? "Path required" : undefined,
  });

  return {
    dependencies: {
      "better-sqlite3": dependencies["better-sqlite3"],
    },
    imports: {
     "{sqlite}" : "@primate/store",
    },
    driver: {
      name: "sqlite",
      options: {filename},
    },
  };
};

