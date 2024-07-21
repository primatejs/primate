import { default_extension, name } from "@primate/frontend/marko/common";
import build from "@primate/frontend/marko/hooks/build";
import serve from "@primate/frontend/marko/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
