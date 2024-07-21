import build from "./build.js";
import serve from "../runtime/serve.js";
import { defaults } from "@primate/store/mysql/common";

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
