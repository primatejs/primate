import build from "./build.js";
import serve from "../runtime/serve.js";

export default () => ({
  build,
  serve: serve(),
});
