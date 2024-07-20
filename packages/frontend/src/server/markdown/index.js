import build from "./build.js";
import name from "./name.js";
import serve from "./serve.js";

const default_extension = ".md";

export default ({
  extension = default_extension,
  options,
} = {}) => ({
  name: `primate:${name}`,
  build: build(extension, options),
  serve: serve(extension),
});
