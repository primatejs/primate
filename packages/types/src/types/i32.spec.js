import i32 from "./i32.js";
import {reassert, imatch, ifail} from "./base.spec.js";

export default test => {
  reassert(test, i32);

  test.case("fail", ({fail}) => {
    ifail(fail);
  });
  test.case("match", ({match}) => {
    imatch(match);
  });
  test.case("range", ({same, match, fail}) => {
    same(0, -0, 1, 1, -2_147_483_648, 2_147_483_647);
    match(-2_147_483_648n, -2_147_483_648);
    match("-2147483648", -2_147_483_648);
    match(2_147_483_647n, 2_147_483_647);
    match("2147483647", 2_147_483_647);
    fail(-2_147_483_649, "-2147483649", 2_147_483_648, "2147483648");
  });
};
