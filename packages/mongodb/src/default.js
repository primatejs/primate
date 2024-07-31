import defaults from "#defaults";
import serve from "#serve";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
} = {}) => ({
  serve: serve({ host, port, database }),
});
