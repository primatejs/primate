import boolean from "#type/boolean";

export default test => {
  test.case("fail", assert => {
    assert(() => (boolean.validate("true"))).throws("expected boolean, got `true` (string)");
  });

  test.case("pass", assert => {
    assert((boolean.validate(true))).equals(true);
    assert((boolean.validate(false))).equals(false);
  });
}
