import build from "#webc/build";
import default_extension from "#webc/extension";
import name from "#webc/name";
import serve from "#webc/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
