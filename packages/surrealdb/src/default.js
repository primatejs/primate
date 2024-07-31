import defaults from "#defaults";
import serve from "#serve";

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
