import { default_extension, name } from "@primate/frontend/html/common";
import serve from "@primate/frontend/html/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
