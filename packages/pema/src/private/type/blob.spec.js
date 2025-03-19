import blob from "#type/blob";
import expect from "#type/expect";

export default test => {
  test.case("fail", assert => {
    assert(() => blob.validate("1")).throws(expect("bb", "1"));
  })

  test.case("pass", assert => {
    const b = new Blob();
    assert(blob.validate(b)).equals(b);

    // File extends Blob
    const f = new File([""], "");
    assert(blob.validate(f)).equals(f);
  })
}
