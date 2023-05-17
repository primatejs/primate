import int16 from "./int16.js";
import {reassert} from "./base.spec.js";

export default test => {
  reassert(test, int16);

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
    same(0, -0, 1, 1, 32_767, -32_768);
    fail(32_768, -32_769);
  });
};
