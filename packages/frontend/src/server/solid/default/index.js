import { default_extension, name } from "@primate/frontend/solid/common";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({
  extension = default_extension,
  // activate fetch-based browsing
  spa = true,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension, spa),
});
