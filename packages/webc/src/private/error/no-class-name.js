import pkgname from "#pkgname";
import log from "@primate/core/log";
import FileRef from "@rcompat/fs/FileRef";

export default (...params) => log.error({
  params,
  name: new FileRef(import.meta.url).base,
  module: pkgname,
  message: "the component at {0} is missing a class name",
  fix: "add a class name to the component",
});
