import { text } from "../prompts.js";

export default async () => {
  const database = await text({
    message: "Enter database file path",
    validate: value => value.length === 0 ? "Path required" : undefined,
  });

  return {
    imports: {
     json: "@primate/store/json",
    },
    driver: {
      name: "json",
      options: { database },
    },
  };
};
