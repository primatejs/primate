import { default_extension, name } from "@primate/frontend/marko/common";
import serve from "@primate/frontend/marko/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
