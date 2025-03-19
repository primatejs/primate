import string from "#type/string";
import expect from "#type/expect";

export default test => {
  test.case("fail", assert => {
    assert(() => (string.validate(1))).throws(expect("s", 1));
  });

  test.case("pass", assert => {
    assert(string.validate("test")).equals("test");
  });
}
