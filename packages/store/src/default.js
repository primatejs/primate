import modes from "@primate/store/base/modes";
import build from "@primate/store/hooks/build";
import route from "@primate/store/hooks/route";
import serve from "@primate/store/hooks/serve";
import memory from "@primate/store/memory";
import assert from "@rcompat/invariant/assert";

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
    serve: serve(directory, mode, driver.serve, env),
    route: route(env),
  };
};