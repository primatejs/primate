import error from "#log/error";
import name from "#name";

export default error(name)(import.meta.url, {
  message: "double route of the form {0}",
  fix: "disambiguate routes",
});
