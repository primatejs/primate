import u8 from "./u8.js";
import { reassert } from "./common.spec.js";

export default test => {
  reassert(test, u8);

  test.case("fail", ({ fail }) => {
    fail(undefined, true, {}, null, [], 1.1, "1n");
  });
  test.case("match", ({ match }) => {
    match(1n, 1);
    match("1", 1);
  });
  test.case("range", ({ same, match, fail }) => {
    same(0, 1, 255);
    match(0n, 0);
    match("0", 0);
    match(255n, 255);
    match("255", 255);
    fail(-1, 256);
    fail(-1n, "-1"/* , -0n, -0*/, 256n, "256");
  });
};
