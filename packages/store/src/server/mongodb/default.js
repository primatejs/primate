import { defaults } from "@primate/store/mongodb/common";
import serve from "@primate/store/mongodb/hooks/serve";

export default ({
  host = defaults.host,
  port = defaults.port,
  database,
} = {}) => ({ serve: serve({ host, port, database }) });
