import pkgname from "#pkgname";
import log from "@primate/core/log";
import file from "@rcompat/fs/file";

export default (...params) => log.error({
  params,
  name: file(import.meta.url).base,
  module: pkgname,
  message: "error in Go route {0}",
  fix: "fix route error:\n{1}",
});
