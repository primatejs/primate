import uuid from "./uuid.js";
import { reassert } from "./common.spec.js";

export default test => {
  reassert(test, uuid);

  test.case("fail", ({ fail }) => {
    fail(undefined, "", 1, true, {}, null, []);
    /* invalid characters */
    fail("4d0996 b-BDA9-4f95-ad7c-7075b10d4ba6");
    fail("4d0996db-BD$9-4f95-ad7c-7075b10d4ba6");
    fail("4d0996db-BDA9-%f95-ad7c-7075b10d4ba6");
  });
  test.case("same", ({ same }) => {
    const value = "4d0996db-BDA9-4f95-ad7c-7075b10d4ba6";
    same(value, value.toUpperCase(), value.toLowerCase());
  });
};
