import { defaults } from "@primate/store/mysql/common";
import serve from "./serve.js";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  username,
  password,
} = {}) => ({
  serve: serve({ host, port, database, username, password }),
});
