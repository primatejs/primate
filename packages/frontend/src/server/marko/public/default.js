import build from "#marko/build";
import default_extension from "#marko/extension";
import name from "#marko/name";
import serve from "#marko/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
