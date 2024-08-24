import { error } from "#error";

export default error(import.meta.url, {
  message: "error in component {0}",
  fix: "fix component error:\n{1}",
});
