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
  user,
  password,
} = {}) => ({
  build: build(name),
  serve: serve({ host, port, database, user, password }),
});
