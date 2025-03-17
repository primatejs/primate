import array from "#type/array";
import boolean from "#type/boolean";
import date from "#type/date";
import expect from "#type/expect";
import number from "#type/number";
import string from "#type/string";

const s = array(string);
const n = array(number);
const b = array(boolean);
const d = array(date);

const as = ["0"];
const an = [0];
const ab = [false];
const ad = [new Date()];

const x = (y, length = 2) => Array.from({ length }, _ => y).flat();

export default test => {
  test.case("empty", assert => {
    assert(s.validate([])).equals([]);
    assert(n.validate([])).equals([]);
    assert(b.validate([])).equals([]);
    assert(d.validate([])).equals([]);
  });

  test.case("flat", assert => {
    assert(s.validate(as)).equals(as);
    assert(n.validate(an)).equals(an);
    assert(b.validate(ab)).equals(ab);
    assert(d.validate(ad)).equals(ad);

    assert(s.validate(x(as))).equals(x(as));
    assert(n.validate(x(an, 3))).equals(x(an, 3));
    assert(b.validate(x(ab, 4))).equals(x(ab, 4));
    assert(d.validate(x(ad, 5))).equals(x(ad, 5))

    assert(() => s.validate(an)).throws(expect("s", 0, "[0]"));
    assert(() => n.validate(ab)).throws(expect("n", false, "[0]"));
    assert(() => b.validate(ad)).throws(expect("b", new Date(), "[0]"));
    assert(() => d.validate(as)).throws(expect("d", "0", "[0]"));

    assert(() => s.validate([...as, ...an])).throws(expect("s", 0, "[1]"));
    assert(() => n.validate([...as, ...an])).throws(expect("n", "0", "[0]"));
    assert(() => b.validate([...ab, ...ad])).throws(expect("b", new Date(), "[1]"));
    assert(() => d.validate([...ab, ...ad])).throws(expect("d", false, "[0]"));
  });

  test.case("deep", assert => {
    // recursive
    const rc = array(array(string));
    assert(rc.validate([as])).equals([as]);

    assert(() => rc.validate(as)).throws(expect("a", "0", "[0]"));
    assert(() => rc.validate([[0]])).throws();
  });
}
