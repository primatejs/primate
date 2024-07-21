import { default_extension, name } from "@primate/frontend/htmx/common";
import build from "@primate/frontend/htmx/hooks/build";
import serve from "@primate/frontend/htmx/hooks/serve";

export default ({
  extension = default_extension,
  extensions = [],
  client_side_templates = [],
} = {}) => ({
  name: `primate:${name}`,
  build: build({ extension, extensions, client_side_templates }),
  serve: serve(extension),
});
