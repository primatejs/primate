import default_extension from "@primate/frontend/svelte/common/extension";
import name from "@primate/frontend/svelte/common/name";
import serve from "./serve.js";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension, spa),
});
