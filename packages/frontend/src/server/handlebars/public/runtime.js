import default_extension from "#handlebars/extension";
import name from "#handlebars/name";
import serve from "#handlebars/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
