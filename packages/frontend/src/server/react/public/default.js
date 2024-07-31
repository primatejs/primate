import build from "#react/build";
import default_extension from "#react/extension";
import name from "#react/name";
import serve from "#react/serve";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension, spa),
});
