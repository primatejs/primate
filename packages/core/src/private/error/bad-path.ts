import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "bad path {0}",
  fix: "use only letters, digits, '_', '[', ']' or '=' in path filenames",
});
