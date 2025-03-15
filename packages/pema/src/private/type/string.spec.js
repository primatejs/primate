import string from "#type/string";

export default test => {
  test.case("fail", assert => {
    assert(() => (string.validate(1))).throws("expected string, got `1` (number)");
  });

  test.case("pass", assert => {
    assert(string.validate("test")).equals("test");
  });
}
