import default_extension from "#webc/extension";
import name from "#webc/name";
import serve from "#webc/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
