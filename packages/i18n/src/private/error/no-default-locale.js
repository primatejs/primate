import { warn } from "#error";

export default warn(import.meta.url, {
  message: "default locale {0} not found in locales directory {1}",
  fix: "add {0} as a locale",
});
