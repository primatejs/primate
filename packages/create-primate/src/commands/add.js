import resolve from "@rcompat/fs/resolve";
import { intro } from "@clack/prompts";
import { select } from "../prompts.js";

const options = [
  {
    value: () => undefined,
    label: "Add route",
  },
];

export default async () => {
  intro(`Managing ${resolve()}`);

  const selected = await select({
    message: "Choose action",
    options,
  });
};
