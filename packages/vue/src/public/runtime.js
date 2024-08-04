import default_extension from "#vue/extension";
import pkgname from "#name";
import serve from "#vue/serve";

export default ({ extension = default_extension } = {}) => ({
  name: pkgname,
  serve: serve(extension),
});
