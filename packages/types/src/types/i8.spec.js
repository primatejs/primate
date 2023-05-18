import i8 from "./i8.js";
import {reassert, imatch, ifail} from "./base.spec.js";

export default test => {
  reassert(test, i8);

  test.case("fail", ({fail}) => {
    ifail(fail);
  });
  test.case("match", ({match}) => {
    imatch(match);
  });
  test.case("range", ({same, match, fail}) => {
    same(0, -0, 1, 1, -128, 127);
    match(-128n, -128);
    match("-128", -128);
    match(127n, 127);
    match("127", 127);
    fail(-129, "-129", 128, "128");
  });
};
