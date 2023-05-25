import boolean from "./boolean.js";
import {reassert} from "./common.spec.js";

export default test => {
  reassert(test, boolean);

  test.case("fail", ({fail}) => {
    fail(undefined, {}, null, [], 0, 0.5, 1, 1.5, "0", "1", "True", "False");
  });
  test.case("match", ({match}) => {
    match("true", true);
    match("false", false);
  });
  test.case("same", ({same}) => {
    same(true, false);
  });
};
