import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "empty path parameter {0} in route {1}",
  fix: "name the parameter or remove it",
});
