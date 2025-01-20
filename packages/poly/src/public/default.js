import build from "#build";
import default_extension from "#extension";
import pkgname from "#pkgname";
import serve from "#serve";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
  // activate ssr
  ssr = true,
} = {}) => ({
  name: pkgname,
  build: build(extension, ssr),
  serve: serve(extension, spa, ssr),
});
