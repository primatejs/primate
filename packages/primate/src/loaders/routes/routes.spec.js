import { Path } from "runtime-compat/fs";
import loader from "./routes.js";
import { mark } from "../../Logger.js";

const log = {
  auto(error) {
    throw error;
  },
};
const directory = new Path("/routes");

const routes = defs => loader(log, directory, ({ warn = true }) =>
  warn ? defs : []);

const get = () => null;

export default test => {
  test.case("errors.DoubleRouted", assert => {
    const post = ["post", { get }];
    const throws = mark("double route of the form {0}", "post");
    assert(() => routes([post, post])).throws(throws);
    const index = [["post", { get }], ["post/index", { get }]];
    const throws2 = mark("double route of the form {0}", "post");
    assert(() => routes(index)).throws(throws2);
    const paths = [["{foo}/{bar}/t/index", { get }],
      ["{bar=baz}/{baz}/t", { get }]];
    const throws3 = mark("double route of the form {0}", "{0}/{1}/t");
    assert(() => routes(paths)).throws(throws3);
  });
};
