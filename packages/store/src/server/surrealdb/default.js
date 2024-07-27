import { defaults } from "@primate/store/surrealdb/common";
import serve from "@primate/store/surrealdb/hooks/serve";

export default ({
  host = defaults.host,
  port = defaults.port,
  path = defaults.path,
  namespace,
  database,
  username,
  password,
} = {}) => ({
  serve: serve({ host, port, path, namespace, database, username, password }),
});
