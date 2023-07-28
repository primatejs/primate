import {text} from "../prompts.js";

export default async () => {
  const filename = await text({
    message: "Enter database file path",
    validate: value => value.length === 0 ? "Path required" : undefined,
  });

  return {
    imports: {
     "{json}" : "@primatejs/store",
    },
    driver: {
      name: "json",
      options: {filename},
    },
  };
};
