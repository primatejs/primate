import { defaults } from "@primate/store/postgresql/common";
import serve from "../runtime/serve.js";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  username,
  password,
} = {}) => ({
  serve: serve({ host, port, database, username, password }),
});
