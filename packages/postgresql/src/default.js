import defaults from "#defaults";
import serve from "#serve";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  username,
  password,
} = {}) => ({
  serve: serve({ host, port, database, username, password }),
});
