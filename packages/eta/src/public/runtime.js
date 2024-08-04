import default_extension from "extension";
import name from "name";
import serve from "serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
