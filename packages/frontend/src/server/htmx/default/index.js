import { default_extension, name } from "@primate/frontend/htmx/common";
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
