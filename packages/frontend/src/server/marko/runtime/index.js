import default_extension from "@primate/frontend/marko/common/extension";
import name from "@primate/frontend/marko/common/name";
import serve from "./serve.js";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
