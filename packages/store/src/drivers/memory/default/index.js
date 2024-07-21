import build from "./build.js";
import serve from "../runtime/serve.js";

const name = "memory";

export default () => ({
  build: build(name),
  serve: serve(),
});
