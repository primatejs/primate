import { warn } from "#error";

export default warn(import.meta.url, {
  message: "store directory does not exist",
  fix: "create {0} and populate it",
});
