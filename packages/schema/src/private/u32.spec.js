import u32 from "#u32.js";
import { reassert } from "./common.spec.js";

export default test => {
  reassert(test, u32);

  test.case("fail", ({ fail }) => {
    fail(undefined, true, {}, null, [], 1.1, "1n");
  });
  test.case("match", ({ match }) => {
    match(1n, 1);
    match("1", 1);
  });
  test.case("range", ({ same, match, fail }) => {
    same(0, 1, 4_294_967_295);
    match(0n, 0);
    match("0", 0);
    match(4_294_967_295n, 4_294_967_295);
    match("4294967295", 4_294_967_295);
    fail(-1, -1n, "-1"/* -0n, -0*/, 4_294_967_296, 4_294_967_296n, "4294967296");
  });
};
