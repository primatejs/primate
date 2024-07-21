import { default_extension, name } from "@primate/frontend/react/common";
import build from "@primate/frontend/react/hooks/build";
import serve from "@primate/frontend/react/hooks/serve";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension, spa),
});
