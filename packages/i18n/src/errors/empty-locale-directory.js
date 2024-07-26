import warn from "@primate/core/logger/warn";

export default warn({
  name: "EmptyLocaleDirectory",
  message: "empty locale directory",
  fix: "populate {0} with locales or remove it",
  module: "primate/i18n",
});
