import build from "#solid/build";
import default_extension from "#solid/extension";
import name from "#solid/name";
import serve from "#solid/serve";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension, spa),
});
