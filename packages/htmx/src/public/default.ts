import build from "#build";
import default_extension from "#extension";
import pkgname from "#pkgname";
import serve from "#serve";
import type Module from "@primate/core/frontend/Module";

export default ({
  extension = default_extension,
  extensions = [],
  client_side_templates = [],
} = {}): Module => ({
  name: pkgname,
  build: build({ extension, extensions, client_side_templates }),
  serve: serve(extension),
});
