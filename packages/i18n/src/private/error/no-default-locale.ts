import warn from "@primate/core/log/warn";
import name from "#name";

export default warn(name)(import.meta.url, {
  message: "default locale {0} not found in locales directory {1}",
  fix: "add {0} as a locale",
});
