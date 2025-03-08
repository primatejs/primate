import { error } from "#error";

export default error(import.meta.url, {
  message: "missing component {0}",
  fix: "create {1} or remove route function",
});
