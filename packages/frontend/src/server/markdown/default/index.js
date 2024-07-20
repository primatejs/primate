import default_extension from "@primate/frontend/markdown/common/extension";
import name from "@primate/frontend/markdown/common/name";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({ extension = default_extension, options } = {}) => ({
  name: `primate:${name}`,
  build: build(extension, options),
  serve: serve(extension),
});
