import info from "#log/info";
import name from "#name";

export default info(name)(import.meta.url, {
  message: "mismatched path {0}: {1}",
  fix: "fix the type or the caller",
});
