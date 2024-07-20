import build from "./build.js";
import name from "./name.js";
import serve from "./serve.js";

const default_extension = ".htmx";

export default ({
  extension = default_extension,
  extensions = [],
  client_side_templates = [],
} = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension),
  build: build({ extension, extensions, client_side_templates }),
});
