import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "error in component {0}",
  fix: "fix component error:\n{1}",
});
