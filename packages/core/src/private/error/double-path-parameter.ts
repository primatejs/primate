import { error } from "#error";

export default error(import.meta.url, {
  message: "double path parameter {0} in route {1}",
  fix: "disambiguate path parameters in route names",
});
