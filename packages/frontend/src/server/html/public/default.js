import build from "#html/build";
import default_extension from "#html/extension";
import name from "#html/name";
import serve from "#html/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
