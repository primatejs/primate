import { defaults } from "@primate/store/sqlite/common";
import serve from "./serve.js";

export default ({
  database = defaults.database,
} = {}) => ({
  serve: serve({ database }),
});
