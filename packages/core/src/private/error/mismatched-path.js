import { info } from "#error";

export default info(import.meta.url, {
  message: "mismatched path {0}: {1}",
  fix: "fix the type or the caller",
});
