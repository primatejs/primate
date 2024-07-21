import { default_extension, name } from "@primate/frontend/voby/common";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
