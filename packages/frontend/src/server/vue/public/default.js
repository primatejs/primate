import build from "#vue/build";
import default_extension from "#vue/extension";
import name from "#vue/name";
import serve from "#vue/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
