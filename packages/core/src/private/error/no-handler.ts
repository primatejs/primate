import { error } from "#error";

export default error(import.meta.url, {
  message: "no handler for {0}",
  fix: "add handler module for this component or remove {0}",
});
