import serve from "#htmx/serve";
import default_extension from "#htmx/extension";
import name from "#htmx/name";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
