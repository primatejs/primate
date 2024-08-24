import u16 from "#u16";
import { reassert } from "./common.spec.js";

export default test => {
  reassert(test, u16);

  test.case("fail", ({ fail }) => {
    fail(undefined, true, {}, null, [], 1.1, "1n");
  });
  test.case("match", ({ match }) => {
    match(1n, 1);
    match("1", 1);
  });
  test.case("range", ({ same, match, fail }) => {
    same(0, 1, 65_535);
    match(0n, 0);
    match("0", 0);
    match(65_535n, 65_535);
    match("65535", 65_535);
    fail(-1, 65_536);
    fail(-1n, "-1"/* , -0n, -0*/, 65_536n, "65536");
  });
};
