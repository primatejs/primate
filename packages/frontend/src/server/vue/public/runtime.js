import default_extension from "#vue/extension";
import name from "#vue/name";
import serve from "#vue/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
