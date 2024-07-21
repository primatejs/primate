import { defaults } from "@primate/store/sqlite/common";
import serve from "../runtime/serve.js";
import build from "./build.js";

export default ({
  database = defaults.database,
} = {}) => ({
  build,
  serve: serve({ database }),
});
