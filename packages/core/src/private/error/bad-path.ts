import { error } from "#error";

export default error(import.meta.url, {
  message: "bad path {0}",
  fix: "use only letters, digits, '_', '[', ']' or '=' in path filenames",
});
