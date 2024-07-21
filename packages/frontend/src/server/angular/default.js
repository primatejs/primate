import { default_extension, name } from "@primate/frontend/angular/common";
import build from "@primate/frontend/angular/hooks/build";
import serve from "@primate/frontend/angular/hooks/serve";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
