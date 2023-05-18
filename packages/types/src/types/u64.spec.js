import u64 from "./u64.js";
import {reassert, ifail} from "./base.spec.js";

export default test => {
  reassert(test, u64);

  test.case("fail", ({fail, match}) => {
    ifail(fail);
  });
  test.case("match", ({match}) => {
    match("1.0", 1n);
    match(1.0, 1n);
    match(0, 0n);
    match(1, 1n);
    match("1", 1n);
  });
  test.case("range", ({same, match, fail}) => {
    same(0n, 1n, 18_446_744_073_709_551_615n);
    match(0, 0n);
    match("0", 0n);
    match("18446744073709551615", 18_446_744_073_709_551_615n);
    fail("-1", -1, -1n/*, "-0", -0, -0n*/);
    fail(18_446_744_073_709_551_616n, "18446744073709551616");
  });
};
