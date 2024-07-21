import modes from "@primate/store/base/modes";
import memory from "@primate/store/memory";
import { assert } from "rcompat/invariant";
import route from "../runtime/route.js";
import serve from "../runtime/serve.js";
import build from "./build.js";

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
    build: build(directory, driver.build),
    serve: serve(directory, mode, driver.serve, env),
    route: route(env),
  };
};
