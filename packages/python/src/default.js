import build from "#build";
import default_extension from "#extension";
import pkgname from "#pkgname";

export default ({ extension = default_extension, packages = [] } = {}) => ({
  name: pkgname,
  build: build({ extension, packages })
});
