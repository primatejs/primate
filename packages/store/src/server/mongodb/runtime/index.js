import serve from "./serve.js";

const defaults = {
  host: "localhost",
  port: 27017,
};

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
} = {}) => ({
  serve: serve({ host, port, database }),
});
