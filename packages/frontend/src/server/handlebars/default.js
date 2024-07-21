import { name, default_extension } from "@primate/frontend/handlebars/common";
import build from "@primate/frontend/handlebars/hooks/build";
import serve from "@primate/frontend/handlebars/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
