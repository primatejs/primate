import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "module at index {0} has no name",
  fix: "update module at index {0} and inform maintainer",
});
