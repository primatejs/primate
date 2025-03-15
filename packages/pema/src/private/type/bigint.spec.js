import bigint from "#type/bigint";

export default test => {
  test.case("fail", assert => {
    assert(() => (bigint.validate("1"))).throws("expected bigint, got `1` (string)");
    assert(() => (bigint.validate(1))).throws("expected bigint, got `1` (number)");
  })

  test.case("pass", assert => {
    assert(bigint.validate(1n)).equals(1n);
  })
}
