import default_extension from "@primate/frontend/solid/common/extension";
import name from "@primate/frontend/solid/common/name";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension, spa),
});
