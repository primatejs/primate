import { default_extension, name } from "@primate/frontend/angular/common";
import serve from "@primate/frontend/angular/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
});
