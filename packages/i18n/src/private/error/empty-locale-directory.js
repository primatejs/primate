import { warn } from "#error";

export default warn(import.meta.url, {
  message: "empty locale directory",
  fix: "populate {0} with locales or remove it",
});
