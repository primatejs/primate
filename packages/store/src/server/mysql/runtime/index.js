import serve from "./serve.js";

const defaults = {
  host: "localhost",
  port: 3306,
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
