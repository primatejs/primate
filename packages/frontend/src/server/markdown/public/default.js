import build from "#markdown/build";
import default_extension from "#markdown/extension";
import name from "#markdown/name";
import serve from "#markdown/serve";

export default ({ extension = default_extension, options } = {}) => ({
  name: `primate:${name}`,
  build: build(extension, options),
  serve: serve(extension),
});
