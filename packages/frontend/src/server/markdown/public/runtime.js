import default_extension from "#markdown/extension";
import name from "#markdown/name";
import serve from "#markdown/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
