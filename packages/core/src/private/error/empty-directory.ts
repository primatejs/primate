import { warn } from "#error";

export default warn(import.meta.url, {
  message: "empty {0} directory",
  fix: "populate {1} or remove it",
});
