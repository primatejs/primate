import default_extension from "#eta/extension";
import name from "#eta/name";
import serve from "#eta/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
