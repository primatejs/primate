import u128 from "./u128.js";
import {reassert, ifail} from "./common.spec.js";

export default test => {
  reassert(test, u128);

  test.case("fail", ({fail}) => {
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
    same(0n, 1n, 340_282_366_920_938_463_463_374_607_431_768_211_455n);
    match(0, 0n);
    match("0", 0n);
    match("340282366920938463463374607431768211455",
          340_282_366_920_938_463_463_374_607_431_768_211_455n);
    fail("-1", -1, -1n/*, "-0", -0, -0n*/);
    fail(340_282_366_920_938_463_463_374_607_431_768_211_456n);
    fail("340282366920938463463374607431768211456");
  });
};
