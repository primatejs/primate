import pkgname from "#pkgname";
import log from "@primate/core/log";
import file from "@rcompat/fs/file";

export default (...params) => log.error({
  params,
  name: file(import.meta.url).base,
  module: pkgname,
  message: "the extension {0} is required for {1} client side support",
  fix: "add \"{0}\" to the `extensions` array for the HTMX module",
});
