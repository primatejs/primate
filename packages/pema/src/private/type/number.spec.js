import number from "#type/number";

export default test => {
  test.case("fail", assert => {
    assert(() => (number.validate("1"))).throws("expected number, got `1` (string)");
    assert(() => (number.validate(1n))).throws("expected number, got `1` (bigint)");
  })

  test.case("pass", assert => {
    assert(number.validate(1)).equals(1);
  })
}
