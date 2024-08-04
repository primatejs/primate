import build from "#build";
import default_extension from "#extension";
import pkgname from "#pkgname";
import serve from "#serve";

export default ({
  extension = default_extension,
  extensions = [],
  client_side_templates = [],
} = {}) => ({
  name: pkgname,
  build: build({ extension, extensions, client_side_templates }),
  serve: serve(extension),
});
