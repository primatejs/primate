import { error } from "#error";

export default error(import.meta.url, {
  message: "module at index {0} has no name",
  fix: "update module at index {0} and inform maintainer",
});
