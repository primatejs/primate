import { name, default_extension } from "@primate/frontend/handlebars/common";
import serve from "@primate/frontend/handlebars/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
