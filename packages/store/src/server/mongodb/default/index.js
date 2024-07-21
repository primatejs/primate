import build from "./build.js";
import serve from "../runtime/serve.js";

const defaults = {
  host: "localhost",
  port: 27017,
};
const name = "mongodb";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
} = {}) => ({
  build: build(name),
  serve: serve({ host, port, database }),
});
