import build from "./build.js";
import serve from "../runtime/serve.js";

const defaults = {
  host: "localhost",
  port: 5432,
};
const name = "postgresql";

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
