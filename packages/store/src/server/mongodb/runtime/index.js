import { defaults } from "@primate/store/mongodb/common";
import serve from "./serve.js";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
} = {}) => ({
  serve: serve({ host, port, database }),
});
