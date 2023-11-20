import { Path } from "rcompat/fs";
import loader from "./routes.js";
import { mark } from "../Logger.js";

const app = {
  log: {
    auto(error) {
      throw error;
    },
  },
  runpath() {
    return new Path("/routes");
  },
};

const routes = defs => loader(app, ({ warn = true }) =>
  warn ? defs : []);

const get = () => null;

export default test => {
  test.case("errors.EmptyRoutefile", assert => {
    const path = "user";
    const throws = mark("empty route file at {0}", `/routes/${path}.js`);
    assert(() => routes([[path, undefined]])).throws(throws);
    assert(() => routes([[path, {}]])).throws(throws);
  });
  test.case("errors.DoublePathParameter", async assert => {
    const path = "{user}/{user}";
    const throws = mark("double path parameter {0} in route {1}", "user", path);
    try {
      await routes([[path, { get }]]);
    } catch (error) {
      assert(error.message).equals(throws);
    }
  });
  test.case("errors.InvalidPathParameter", assert => {
    const path = "{us$er}";
    const err1 = mark("invalid path parameter {0} in route {1}", "us$er", path);
    assert(() => routes([[path, { get }]])).throws(err1);
    const path2 = "{}";
    const err2 = mark("invalid path parameter {0} in route {1}", "", path2);
    assert(() => routes([[path2, { get }]])).throws(err2);
  });
};
