import i16 from "./i16.js";
import { reassert, imatch, ifail } from "./common.spec.js";

export default test => {
  reassert(test, i16);

  test.case("fail", ({ fail }) => {
    ifail(fail);
  });
  test.case("match", ({ match }) => {
    imatch(match);
  });
  test.case("range", ({ same, match, fail }) => {
    same(0, -0, 1, 1, -32_768, 32_767);
    match(-32_768n, -32_768);
    match("-32768", -32_768);
    match(32_767n, 32_767);
    match("32767", 32_767);
    fail(-32_769, "-32769", 32_768, "32768");
  });
};
