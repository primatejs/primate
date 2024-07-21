import { defaults } from "@primate/store/postgresql/common";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  username,
  password,
} = {}) => ({
  build,
  serve: serve({ host, port, database, username, password }),
});
