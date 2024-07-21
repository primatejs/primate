import build from "./build.js";
import serve from "../runtime/serve.js";

const defaults = {
  filename: ":memory:",
};
const name = "sqlite";

export default ({
  filename = defaults.filename,
} = {}) => ({
  build: build(name),
  serve: serve(filename),
});
