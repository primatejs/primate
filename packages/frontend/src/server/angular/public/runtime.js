import default_extension from "#angular/extension";
import name from "#angular/name";
import serve from "#angular/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
