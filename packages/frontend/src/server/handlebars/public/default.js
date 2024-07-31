import build from "#handlebars/build";
import default_extension from "#handlebars/extension";
import name from "#handlebars/name";
import serve from "#handlebars/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
