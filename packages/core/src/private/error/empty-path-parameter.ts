import { error } from "#error";

export default error(import.meta.url, {
  message: "empty path parameter {0} in route {1}",
  fix: "name the parameter or remove it",
});
