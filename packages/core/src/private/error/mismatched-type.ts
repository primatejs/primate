import { info } from "#error";

export default info(import.meta.url, {
  message: "mismatched type: {0}",
  fix: "fix the type or the caller",
});
