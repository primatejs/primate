import warn from "@primate/core/log/warn";
import name from "#name";

export default warn(name)(import.meta.url, {
  message: "empty locale directory",
  fix: "populate {0} with locales or remove it",
});
