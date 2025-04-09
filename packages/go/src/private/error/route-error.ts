import pkgname from "#pkgname";
import log from "@primate/core/log";
import FileRef from "@rcompat/fs/FileRef";

export default (...params: string[]) => log.error({
  params,
  name: new FileRef(import.meta.url).base,
  module: pkgname,
  message: "error in Go route {0}",
  fix: "fix route error:\n{1}",
});
