import default_extension from "@primate/frontend/htmx/common/extension";
import name from "@primate/frontend/htmx/common/name";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({
  extension = default_extension,
  extensions = [],
  client_side_templates = [],
} = {}) => ({
  name: `primate:${name}`,
  build: build({ extension, extensions, client_side_templates }),
  serve: serve(extension),
});
