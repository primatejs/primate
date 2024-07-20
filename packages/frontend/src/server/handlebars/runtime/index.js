import default_extension from "@primate/frontend/handlebars/common/extension";
import name from "@primate/frontend/handlebars/common/name";
import serve from "./serve.js";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
