import i64 from "./i64.js";
import {reassert, ifail} from "./common.spec.js";

export default test => {
  reassert(test, i64);

  test.case("fail", ({fail}) => {
    ifail(fail);
  });
  test.case("match", ({match}) => {
    match("1.0", 1n);
    match(1.0, 1n);
    match(0, 0n);
    match(-0, 0n);
    match(1, 1n);
    match(-1, -1n);
    match("1", 1n);
    match("-1", -1n);
  });
  test.case("range", ({same, match, fail}) => {
    same(0n, -0n, 1n, 1n);
    same(-9_223_372_036_854_775_808n, 9_223_372_036_854_775_807n);
    match("-9223372036854775808", -9_223_372_036_854_775_808n);
    match("9223372036854775807", 9_223_372_036_854_775_807n);
    fail(-9_223_372_036_854_775_809n, 9_223_372_036_854_775_808n);
    fail("-9223372036854775809", "9223372036854775808");
  });
};
