import build from "#htmx/build";
import default_extension from "#htmx/extension";
import name from "#htmx/name";
import serve from "#htmx/serve";

export default ({
  extension = default_extension,
  extensions = [],
  client_side_templates = [],
} = {}) => ({
  name: `primate:${name}`,
  build: build({ extension, extensions, client_side_templates }),
  serve: serve(extension),
});
