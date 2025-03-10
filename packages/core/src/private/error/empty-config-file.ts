import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "empty config file at {0}",
  fix: "add configuration options to the file or remove it",
});
