import { defaults } from "@primate/store/mongodb/common";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
} = {}) => ({
  build,
  serve: serve({ host, port, database }),
});
