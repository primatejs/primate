import t_null from "#type/null";
import expect from "#type/expect";

export default test => {
  test.case("fail", assert => {
    assert(() => t_null.validate(undefined)).throws(expect("nl", undefined));
  });

  test.case("pass", assert => {
    assert(t_null.validate(null) === null).equals(true);
  });
}
