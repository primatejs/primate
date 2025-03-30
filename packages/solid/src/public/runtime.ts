import default_extension from "#extension";
import pkgname from "#pkgname";
import serve from "#serve";
import type Module from "@primate/core/frontend/Module";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
  // activate ssr
  ssr = true,
} = {}): Module => ({
  name: pkgname,
  serve: serve(extension, spa, ssr),
});
