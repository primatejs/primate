import { default_extension, name } from "@primate/frontend/markdown/common";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({ extension = default_extension, options } = {}) => ({
  name: `primate:${name}`,
  build: build(extension, options),
  serve: serve(extension),
});
