import { default_extension, name } from "@primate/frontend/vue/common";
import build from "@primate/frontend/vue/hooks/build";
import serve from "@primate/frontend/vue/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
