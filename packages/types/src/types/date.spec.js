import date from "./date.js";
import {reassert, basefail} from "./base.spec.js";

export default test => {
  reassert(test, date);

  test.case("fail", ({fail}) => {
    basefail(fail);
  });
  test.case("same", ({same}) => {
    const d = new Date();
    same(d, d);
  });
};
