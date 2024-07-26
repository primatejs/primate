import warn from "@primate/core/logger/warn";

export default warn({
  name: "NoDefaultLocale",
  message: "default locale {0} not found in locales directory {1}",
  fix: "add {0} as a locale",
  module: "primate/i18n",
});
