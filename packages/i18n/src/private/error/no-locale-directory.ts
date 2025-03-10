import warn from "@primate/core/log/warn";
import name from "#name";

export default warn(name)(import.meta.url, {
  message: "locale directory does not exist",
  fix: "create {0} and populate it",
});
