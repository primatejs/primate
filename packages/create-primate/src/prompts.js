import * as clack from "@clack/prompts";

const Bailout = class extends Error {};
export { Bailout };

export const bye = () => {
  throw new Bailout();
};

const cancelable = async prompt => {
  const result = await prompt();
  if (clack.isCancel(result)) {
    bye();
  }
  return result;
};

export const confirm = options => cancelable(() => clack.confirm(options));
export const text = options => cancelable(() => clack.text(options));
export const select = options => cancelable(() => clack.select(options));
export const multiselect = options => cancelable(() =>
  clack.multiselect(options));
