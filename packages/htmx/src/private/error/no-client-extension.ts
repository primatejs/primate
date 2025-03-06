import pkgname from "#pkgname";
import log from "@primate/core/log";
import FileRef from "@rcompat/fs/FileRef";

export default (...params: string[]) => log.error({
  params,
  name: new FileRef(import.meta.url).base,
  module: pkgname,
  message: "the extension {0} is required for {1} client side support",
  fix: "add \"{0}\" to the HTMX `extensions` array in module configuration",
});
