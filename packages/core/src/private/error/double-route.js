import { error } from "#error";

export default error(import.meta.url, {
  message: "double route of the form {0}",
  fix: "disambiguate routes",
});
