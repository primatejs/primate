import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "no handler for {0}",
  fix: "add handler module for this component or remove {0}",
});
