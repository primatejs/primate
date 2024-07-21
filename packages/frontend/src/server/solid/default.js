import { default_extension, name } from "@primate/frontend/solid/common";
import build from "@primate/frontend/solid/hooks/build";
import serve from "@primate/frontend/solid/hooks/serve";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension, spa),
});
