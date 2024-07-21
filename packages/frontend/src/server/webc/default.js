import { default_extension, name } from "@primate/frontend/webc/common";
import build from "@primate/frontend/webc/hooks/build";
import serve from "@primate/frontend/webc/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
