import { defaults } from "@primate/store/surrealdb/common";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({
  host = defaults.host,
  port = defaults.port,
  path = defaults.path,
  namespace,
  database,
  username,
  password,
} = {}) => ({
  build,
  serve: serve({ host, port, path, namespace, database, username, password }),
});
