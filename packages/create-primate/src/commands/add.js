import FS from "rcompat/fs";
import { intro } from "@clack/prompts";
import { select } from "../prompts.js";

const options = [
  {
    value: () => undefined,
    label: "Add route",
  },
];

export default async () => {
  intro(`Managing ${FS.File.resolve()}`);

  const selected = await select({
    message: "Choose action",
    options,
  });
};
