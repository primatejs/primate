import file from "#type/file";

export default test => {
  test.case("fail", assert => {
    assert(() => file.validate("1")).throws("expected file, got `1` (string)");
  })

  test.case("pass", assert => {
    const f = new File([""], "");
    assert(file.validate(f)).equals(f);
  })
}
