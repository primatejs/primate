import array from "#type/array";
import boolean from "#type/boolean";
import number from "#type/number";
import string from "#type/string";

const s = array(string);
const s_n = array(string, number);
const s_n_b = array(string, number, boolean);

const f = ["bar"];
const fb = ["bar", 0];
const fbb = ["bar", 0, false];

export default test => {
  test.case("empty", assert => {
    assert(array().validate([])).equals([]);
  });

  test.case("flat", assert => {
    assert(s.validate(f)).equals(f);
    assert(s_n.validate(fb)).equals(fb);
    assert(s_n_b.validate(fbb)).equals(fbb);

    assert(() => s.validate([])).throws("[0]: expected string, got `undefined` (undefined)");
    assert(() => s_n.validate(f)).throws("[1]: expected number, got `undefined` (undefined)");
  });

  test.case("deep", assert => {
    // recursive
    const rc = array(array(string));
    assert(rc.validate([["foo"]])).equals([["foo"]]);
    assert(() => rc.validate([])).throws();

    // recursive implicit
    const rci = array([string]);
    assert(rci.validate([["foo"]])).equals([["foo"]]);
    assert(() => rci.validate()).throws("expected array, got `undefined` (undefined)");
    assert(() => rci.validate("foo")).throws("expected array, got `foo` (string)");

    assert(() => rci.validate([])).throws("[0]: expected array, got `undefined` (undefined)");
    assert(() => rci.validate(["foo"])).throws("[0]: expected array, got `foo` (string)");

    assert(() => rci.validate([[]])).throws("[0][0]: expected string, got `undefined` (undefined)");
    assert(() => rci.validate([[false]])).throws("[0][0]: expected string, got `false` (boolean)");
  });
}
