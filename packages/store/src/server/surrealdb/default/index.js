import build from "./build.js";
import serve from "../runtime/serve.js";

const defaults = {
  host: "http://localhost",
  port: 8000,
  path: "rpc",
};
const name = "surrealdb";

export default ({
  host = defaults.host,
  port = defaults.port,
  path = defaults.path,
  namespace,
  database,
  username,
  password,
} = {}) => ({
  build: build(name),
  serve: serve({ host, port, path, namespace, database, username, password }),
});
