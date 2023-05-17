import int64 from "./int64.js";
import {reassert} from "./base.spec.js";

export default test => {
  reassert(test, int64);

  test.case("fail", ({fail}) => {
    fail(undefined, true, {}, null, [], 1.1, "1n", "1.0");
  });
  test.case("match", ({match}) => {
    match(0, 0n);
    match(-0, 0n);
    match(1, 1n);
    match(-1, -1n);
    match("1", 1n);
    match("-1", -1n);
  });
  test.case("range", ({same, fail}) => {
    same(0n, -0n, 1n, 1n);
    same(9_223_372_036_854_775_807n, -9_223_372_036_854_775_808n);
    fail(9_223_372_036_854_775_808n, -9_223_372_036_854_775_809n);
  });
};
