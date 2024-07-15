import default_extension from "@primate/frontend/marko/common/extension";
import name from "@primate/frontend/marko/common/name";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
