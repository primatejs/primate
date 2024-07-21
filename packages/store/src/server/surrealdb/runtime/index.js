import serve from "./serve.js";

const defaults = {
  host: "http://localhost",
  port: 8000,
  path: "rpc",
};

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
