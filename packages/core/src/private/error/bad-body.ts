import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "bad body returned from route, got {0}",
  fix: "return a proper body from route",
});
