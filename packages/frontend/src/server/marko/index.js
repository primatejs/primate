import build from "./build.js";
import name from "./name.js";
import serve from "./serve.js";

const default_extension = ".marko";

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  build: build(extension),
  serve: serve(extension),
});
