import memory from "@primate/store/drivers/memory";
import { assert } from "rcompat/invariant";
import build from "./build.js";
import modes from "./modes.js";
import route from "./route.js";
import serve from "./serve.js";

export default ({
  // directory for stores
  directory = "stores",
  // default database driver
  driver = memory(),
  // loose: validate non-empty fields, accept empty/non-defined [default]
  // strict: all fields must be non-empty before saving
  mode = modes.loose,
} = {}) => {
  assert(Object.values(modes).includes(mode),
    "`mode` must be 'strict' or 'loose'");
  const env = {};

  return {
    name: "primate:store",
    build: build(directory),
    serve: serve(directory, mode, driver, env),
    route: route(env),
  };
};
