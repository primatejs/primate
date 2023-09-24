import { text } from "../prompts.js";
import dependencies from "../dependencies.js";

const defaults = {
  host: "localhost",
  port: 5432,
};

export default async () => {
  const host = await text({
    message: "Enter host",
    placeholder: `Leave empty for \`${defaults.host}\``,
    defaultValue: defaults.host,
  });

  const port = await text({
    message: "Enter port",
    placeholder: `Leave empty for \`${defaults.port}\``,
    defaultValue: defaults.port,
  });

  const ns = await text({
    message: "Enter namespace",
    validate: value => value.length === 0 ? "Name required" : undefined,
  });

  const db = await text({
    message: "Enter database name",
    validate: value => value.length === 0 ? "Name required" : undefined,
  });

  return {
    dependencies: {
      "surrealdb.js": dependencies["surrealdb.js"],
    },
    imports: {
     "{surrealdb}" : "@primate/store",
    },
    driver: {
      name: "surrealdb",
      options: { host, port, ns, db },
    },
  };
};
