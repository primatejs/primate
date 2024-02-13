import { File } from "rcompat/fs";
import loader from "./routes.js";
import { mark } from "../Logger.js";

const app = {
  config: {
    location: {
      routes: "routes",
    },
  },
  log: {
    auto(error) {
      throw error;
    },
  },
  runpath() {
    return new File("/routes");
  },
};

const routes = defs => loader(app, ({ warn = true }) =>
  warn ? defs.map(([name, route]) => [name, { default: route }]) : []);

const get = () => null;

export default test => {
  test.case("errors.EmptyRoutefile", assert => {
    const path = "user";
    const throws = mark("empty route file at {0}", `/routes/${path}.js`);
    assert(() => routes([[path, undefined]])).throws(throws);
    assert(() => routes([[path, {}]])).throws(throws);
  });
  test.case("valid path", assert => {
    const max = Number.MAX_SAFE_INTEGER;
    const parts = ["a", "1", "_", "-", ".", "[a$]", "[b$=number]"]
      .map(part => i => part.startsWith("[") ? part.replace("$", i) : part);
    [
      // paths with one part
      ...parts.map(part => part(0)),
      // paths with two parts
      ...parts.map((p1, i) => parts
        .map((p2, j) => i === j ? [] : `${p1(i)}/${p2(j)}`)).flat(max),
      // n parts
    ].forEach(path => {
      assert(() => routes([[path, { get }]])).nthrows();
    });
  });
  test.case("errors.InvalidPath", assert => {
    const path = "(user)";
    const err1 = mark("invalid path {0}", "(user)", path);
    assert(() => routes([[path, { get }]])).throws(err1);
    const path2 = "us$er";
    const err2 = mark("invalid path {0}", "us$er", path2);
    assert(() => routes([[path2, { get }]])).throws(err2);
  });
  test.case("errors.EmptyPathParameter", assert => {
    const path = "[]";
    const err = mark("empty path parameter {0} in route {1}", "", path);
    assert(() => routes([[path, { get }]])).throws(err);
  });
  test.case("errors.DoublePathParameter", async assert => {
    const path = "[user]/[user]";
    const throws = mark("double path parameter {0} in route {1}", "user", path);
    try {
      await routes([[path, { get }]]);
    } catch (error) {
      assert(error.message).equals(throws);
    }
  });
};
