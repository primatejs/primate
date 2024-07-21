import { default_extension, name } from "@primate/frontend/eta/common";
import serve from "@primate/frontend/eta/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
