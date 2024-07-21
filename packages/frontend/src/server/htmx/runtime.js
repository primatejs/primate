import { default_extension, name } from "@primate/frontend/htmx/common";
import serve from "@primate/frontend/htmx/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
