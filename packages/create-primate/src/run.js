import root from "./root.js";
import template from "./template.js";

export default async () => {
  const $root = await root();
  return [$root, await template($root)];
};
