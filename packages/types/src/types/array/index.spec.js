import array from "./array.js";
import string from "./string.js";
import number from "./number.js";
import { reassert } from "./common.spec.js";

const string_array = array.of(string);
const string_array_s2 = array.of(string, 2);
const number_array = array.of(number);

export default test => {
  reassert(test, array);

  test.case("fail", ({ fail }) => {
    fail(undefined, {}, null, 0, 0.5, 1, 1.5, "0", "1", "[]", true, false);
  });
  test.case("same", ({ same }) => {
    same([], Array(), new Array());
  });
  test.case(".of", ({ assert }) => {
    assert(string_array.validate([])).equals([]);
    assert(string_array.validate([""])).equals([""]);
    assert(string_array.validate(["1"])).equals(["1"]);
    const error = `array is not composed of only ${string}`;
    assert(() => string_array.validate([1])).throws(error);

    assert(number_array.validate([])).equals([]);
    assert(number_array.validate([1])).equals([1]);

    assert(() => string_array_s2.validate([])).throws("array is not of size 2");
  });
};
