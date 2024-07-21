import { default_extension, name } from "@primate/frontend/markdown/common";
import build from "@primate/frontend/markdown/hooks/build";
import serve from "@primate/frontend/markdown/hooks/serve";

export default ({ extension = default_extension, options } = {}) => ({
  name: `primate:${name}`,
  build: build(extension, options),
  serve: serve(extension),
});
