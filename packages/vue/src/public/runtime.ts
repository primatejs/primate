import pkgname from "#pkgname";
import serve from "#serve";
import default_extension from "#extension";
import type Module from "@primate/core/frontend/Module";

export default ({ extension = default_extension } = {}): Module => ({
  name: pkgname,
  serve: serve(extension),
});
