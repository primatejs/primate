import date from "#type/date";

export default test => {
  test.case("fail", assert => {
    assert(() => date.validate("1")).throws("expected date, got `1` (string)");
  })

  test.case("pass", assert => {
    const d = new Date();
    assert(date.validate(d)).equals(d);
  })
}
