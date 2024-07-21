import { default_extension, name } from "@primate/frontend/html/common";
import build from "@primate/frontend/html/hooks/build";
import serve from "@primate/frontend/html/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
