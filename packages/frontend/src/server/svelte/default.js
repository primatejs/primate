import { default_extension, name } from "@primate/frontend/svelte/common";
import build from "@primate/frontend/svelte/hooks/build";
import serve from "@primate/frontend/svelte/hooks/serve";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension, spa),
});
