import { default_extension, name } from "@primate/frontend/voby/common";
import build from "@primate/frontend/voby/hooks/build";
import serve from "@primate/frontend/voby/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
