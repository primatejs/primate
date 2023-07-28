import {text} from "../prompts.js";

export default async () => {
  const confs = [];

  const root = await text({
    message: "Enter the path to serve static assets from",
    placeholder: "Leave empty for /",
    validate(value) {
      if (value.length > 0 && !value.startsWith("/")) {
        return "Path must start with /";
      }
    },
  });

  confs.push({
    conf: root === undefined ? {} : {
      http: `{
    static: {
      root: "${root}",
    },
  },`,
    },
  });

  return confs;
};
