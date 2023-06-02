import {Path} from "runtime-compat/fs";
import loader from "./routes.js";
import {mark} from "../Logger.js";

const log = {
  auto(error) {
    throw error;
  },
};
const directory = new Path("/routes");

const routes = defs => loader(log, directory, () => defs);

const get = () => null;

export default test => {
  test.case("errors.DoubleRouted", assert => {
    const post = ["post", {get}];
    const throws = mark("double route of the form {0}", "post");
    assert(() => routes([post, post])).throws(throws);
    const index = [["post", {get}], ["post/index", {get}]];
    const throws2 = mark("double route of the form {0}", "post");
    assert(() => routes(index)).throws(throws2);
    const paths = [["{foo}/{bar}/t/index", {get}],
      ["{bar=baz}/index/{baz}/t", {get}]];
    const throws3 = mark("double route of the form {0}", "{0}/{1}/t");
    assert(() => routes(paths)).throws(throws3);
  });
  test.case("errors.EmptyRoutefile", assert => {
    const path = "user";
    const throws = mark("empty route file at {0}", `/routes/${path}.js`);
    assert(() => routes([[path, undefined]])).throws(throws);
    assert(() => routes([[path, {}]])).throws(throws);
  });
  test.case("error DoublePathParameter", assert => {
    const path = "{user}/{user}";
    const throws = mark("double path parameter {0} in route {1}", "user", path);
    assert(() => routes([[path, {get}]])).throws(throws);
  });
  test.case("error InvalidPathParameter", assert => {
    const path = "{us$er}";
    const err1 = mark("invalid path parameter {0} in route {1}", "us$er", path);
    assert(() => routes([[path, {get}]])).throws(err1);
    const path2 = "{}";
    const err2 = mark("invalid path parameter {0} in route {1}", "", path2);
    assert(() => routes([[path2, {get}]])).throws(err2);
  });
  test.case("error InvalidRouteName", assert => {
    const post = ["po.st", {get}];
    const throws = mark("invalid route name {0}", "po.st");
    assert(() => routes([post])).throws(throws);
  });
};
