import memory from "#driver/memory";
import route from "#hook/route";
import serve from "#hook/serve";
import modes from "#modes";
import name from "#name";
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
    name,
    serve: serve(directory, mode, driver.serve, env),
    route: route(env),
  };
};
