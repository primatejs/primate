import build from "./build.js";
import serve from "../runtime/serve.js";

const defaults = {
  host: "localhost",
  port: 3306,
};
const name = "mysql";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  username,
  password,
} = {}) => ({
  build: build(name),
  serve: serve({ host, port, database, username, password }),
});
