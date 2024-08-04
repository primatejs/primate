import pkgname from "#pkgname";
import serve from "#serve";
import default_extension from "#extension";

export default ({ extension = default_extension } = {}) => ({
  name: pkgname,
  serve: serve(extension),
});
