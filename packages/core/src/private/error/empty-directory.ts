import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "empty {0} directory",
  fix: "populate {1} or remove it",
});
