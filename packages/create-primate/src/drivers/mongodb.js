import {text} from "../prompts.js";

const defaults = {
  host: "localhost",
  port: 27017,
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

  const db = await text({
    message: "Enter database name",
    validate: value => value.length === 0 ? "Name required" : undefined,
  });

  return {
    imports: {
     "{mongodb}" : "@primatejs/store",
    },
    driver: {
      name: "mongodb",
      options: {host, port, db},
    },
  };
};
