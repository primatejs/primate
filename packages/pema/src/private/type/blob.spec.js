import blob from "#type/blob";

export default test => {
  test.case("fail", assert => {
    assert(() => blob.validate("1")).throws("expected blob, got `1` (string)");
  })

  test.case("pass", assert => {
    const b = new Blob();
    assert(blob.validate(b)).equals(b);
  })
}
