import { default_extension, name } from "@primate/frontend/vue/common";
import serve from "@primate/frontend/vue/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
