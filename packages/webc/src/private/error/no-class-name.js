import pkgname from "#pkgname";
import log from "@primate/core/log";
import file from "@rcompat/fs/file";

export default (...params) => log.error({
  params,
  name: file(import.meta.url).base,
  module: pkgname,
  message: "the component at {0} is missing a class name",
  fix: "add a class name to the component",
});
