import build from "#svelte/build";
import default_extension from "#svelte/extension";
import name from "#svelte/name";
import serve from "#svelte/serve";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension, spa),
});
