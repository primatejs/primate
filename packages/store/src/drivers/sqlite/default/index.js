import build from "./build.js";
import serve from "../runtime/serve.js";

const defaults = {
  database: ":memory:",
};
const name = "sqlite";

export default ({
  database = defaults.database,
} = {}) => ({
  build: build(name),
  serve: serve(database),
});
