import { error } from "#error";
import name from "#name";

export default error({
  message: "the extension {0} is required for {1} client side support",
  fix: "add \"{0}\" to the `extensions` array for the HTMX module",
  module: `${name}/htmx`,
});
