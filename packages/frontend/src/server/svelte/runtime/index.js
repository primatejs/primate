import { default_extension, name } from "@primate/frontend/svelte/common";
import serve from "./serve.js";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  serve: serve(extension, spa),
});
