import serve from "../runtime/serve.js";

const defaults = {
  host: "localhost",
  port: 5432,
};

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  username,
  password,
} = {}) => ({
  serve: serve({ host, port, database, username, password }),
});
