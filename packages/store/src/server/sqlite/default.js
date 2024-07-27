import { defaults } from "@primate/store/sqlite/common";
import serve from "@primate/store/sqlite/hooks/serve";

export default ({ database = defaults.database } = {}) =>
  ({ serve: serve({ database }) });
