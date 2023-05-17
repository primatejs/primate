import array from "./array.js";
import {reassert} from "./base.spec.js";

export default test => {
  reassert(test, array);

  test.case("fail", ({fail}) => {
    fail(undefined, {}, null, 0, 0.5, 1, 1.5, "0", "1", "[]", true, false);
  });
  test.case("same", ({same}) => {
    same([], Array(), new Array());
  });
};
