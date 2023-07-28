import {Path} from "runtime-compat/fs";
import * as prompts from "./prompts.js";

const confirm = async root => {
  if ((await root.list()).length > 0) {
    if (!await prompts.confirm({message: "Directory not empty. Continue?"})) {
      prompts.bye();
    }
  }

  return root;
};

export default async () => {
  const value = await prompts.text({
    message: "Enter project root",
    placeholder: "Leave empty for current directory",
    defaultValue: ".",
  });

  return confirm(Path.resolve(value));
};
