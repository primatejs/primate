import { default_extension, name } from "@primate/frontend/eta/common";
import build from "@primate/frontend/eta/hooks/build";
import serve from "@primate/frontend/eta/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
