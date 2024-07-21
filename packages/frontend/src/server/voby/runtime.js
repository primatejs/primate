import { default_extension, name } from "@primate/frontend/voby/common";
import serve from "@primate/frontend/voby/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
