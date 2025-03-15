import symbol from "#type/symbol";

export default test => {
  test.case("fail", assert => {
    assert(() => (symbol.validate("true"))).throws("expected symbol, got `true` (string)");
  });

  test.case("pass", assert => {
    const s = Symbol();
    assert(symbol.validate(s)).equals(s);
  });
}
