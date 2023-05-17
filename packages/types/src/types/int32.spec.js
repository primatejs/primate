import int32 from "./int32.js";
import {reassert} from "./base.spec.js";

export default test => {
  reassert(test, int32);

  test.case("fail", ({fail}) => {
    fail(undefined, true, {}, null, [], 1.1, "1n");
  });
  test.case("match", ({match}) => {
    match(0n, 0);
    match(-0n, -0);
    match(1n, 1);
    match(-1n, -1);
    match("1", 1);
    match("-1", -1);
  });
  test.case("range", ({same, fail}) => {
    same(0, -0, 1, 1, 2_147_483_647, -2_147_483_648);
    fail(2_147_483_648, -2_147_483_649);
  });
};
