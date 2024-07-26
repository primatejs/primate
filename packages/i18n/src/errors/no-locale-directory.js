import warn from "@primate/core/logger/warn";

export default warn({
  name: "NoLocaleDirectory",
  message: "locale directory does not exist",
  fix: "create {0} and populate it",
  module: "primate/i18n",
});
