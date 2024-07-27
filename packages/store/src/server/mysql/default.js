import serve from "@primate/store/mysql/hooks/serve";
import { defaults } from "@primate/store/mysql/common";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  username,
  password,
} = {}) => ({ serve: serve({ host, port, database, username, password }) });
