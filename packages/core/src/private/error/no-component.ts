import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "missing component {0}",
  fix: "create {1} or remove route function",
});
