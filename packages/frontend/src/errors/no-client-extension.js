import error from "@primate/core/logger/error";

export default error({
  name: "NoClientExtension",
  message: "the extension {0} is required for {1} client side support",
  fix: "add \"{0}\" to the `extensions` array for the HTMX module",
  module: "primate/frontend/htmx",
});
