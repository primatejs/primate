import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({ database }) => ({
  build,
  serve: serve({ database }),
});
