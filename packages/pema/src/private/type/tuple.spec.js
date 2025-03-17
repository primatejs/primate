import tuple from "#type/tuple";
import boolean from "#type/boolean";
import number from "#type/number";
import string from "#type/string";
import expect from "#type/expect";

const s = tuple([string]);
const s_s = tuple([string, string]);
const s_n = tuple([string, number]);
const s_n_b = tuple([string, number, boolean]);

const f = ["bar"];
const fb = ["bar", 0];
const fbb = ["bar", 0, false];

const x = (y, length = 2) => Array.from({ length }, _ => y).flat();

export default test => {
  test.case("empty", assert => {
    assert(tuple([]).validate([])).equals([]);
  });

  test.case("flat", assert => {
    assert(s.validate(f)).equals(f);
    assert(s_s.validate(x(f))).equals(x(f));
    assert(s_n.validate(fb)).equals(fb);
    assert(s_n_b.validate(fbb)).equals(fbb);

    assert(() => s.validate([])).throws(expect("s", undefined, "[0]"));
    assert(() => s_n.validate(f)).throws(expect("n", undefined, "[1]"));
    assert(() => s_n_b.validate(x(fb))).throws(expect("b", "bar", "[2]"));
    assert(() => s_n_b.validate(x(fbb))).throws(expect("u", "bar", "[3]"));
  });

  /*test.case("deep", assert => {
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
  });*/
}
