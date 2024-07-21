import serve from "./serve.js";

const defaults = {
  host: "localhost",
  port: 3306,
};

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
  user,
  password,
} = {}) => ({
  serve: serve({ host, port, database, user, password }),
});
