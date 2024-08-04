import default_extension from "#extension";
import pkgname from "#pkgname";
import serve from "#serve";

export default ({ extension = default_extension } = {}) => ({
  name: pkgname,
  serve: serve(extension),
});
