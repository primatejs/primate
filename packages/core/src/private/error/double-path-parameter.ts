import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "double path parameter {0} in route {1}",
  fix: "disambiguate path parameters in route names",
});
