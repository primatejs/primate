import schema from "#type/schema";
import bigint from "#type/bigint";
import blob from "#type/blob";
import boolean from "#type/boolean";
import date from "#type/date";
import number from "#type/number";
import object from "#type/object";
import string from "#type/string";
import symbol from "#type/symbol";
import file from "#type/file";
import array from "#type/array";
import expect from "#type/expect";
import tuple from "#type/tuple";

const types = [
  [bigint, 0n, 0, "bt"],
  [blob, new Blob(), 0, "bb"],
  [boolean, false, "0", "b"],
  [date, new Date(), "0", "d"],
  [number, 0, "0", "n"],
  [string, "0", 0, "s"],
  [symbol, Symbol(), 0, "sy"],
  [file, new File([""], ""), 0, "f"]
];

export default test => {
  test.case("basics", assert => {
    types.forEach(([ validated, good, bad, type ]) => {
      const s = schema(validated);
      assert(s.validate(good)).equals(good);
      assert(() => s.validate(bad)).throws(expect(type, bad));
    })
  });

  test.case("object", assert => {
    const o = { foo: "bar" };

    assert(schema(object({ foo: string })).validate(o)).equals(o);
  });

  test.case("implicit object", assert => {
    const o = { foo: "bar", bar: { baz: 0 } };

    assert(schema({ foo: string, bar: { baz: number } }).validate(o)).equals(o);
  });

  test.case("array", assert => {
    const g0 = [];
    const g1 = ["f"];
    const g2 = ["f", "f"];

    const b0 = [false];
    const b1 = ["f", 0];

    const s = schema(array(string));

    assert(s.validate(g0)).equals(g0);
    assert(s.validate(g1)).equals(g1);
    assert(s.validate(g2)).equals(g2);

    assert(() => s.validate(b0)).throws(expect("s", false, "[0]"));
    assert(() => s.validate(b1)).throws(expect("s", 0, "[1]"));
  })

  test.case("tuple", assert => {
    const g0 = ["f", 0];

    const b0 = [];
    const b1 = ["f"];
    const b2 = [0];
    const b3 = [0, "f"];

    const s = schema(tuple([string, number]));

    assert(s.validate(g0)).equals(g0);

    assert(() => s.validate(b0)).throws(expect("s", undefined, "[0]"));
    assert(() => s.validate(b1)).throws(expect("n", undefined, "[1]"));
    assert(() => s.validate(b2)).throws(expect("s", 0, "[0]"));
    assert(() => s.validate(b3)).throws(expect("s", 0, "[0]"));
  })

  test.case("implicit tuple", assert => {
    const g0 = ["f", 0];

    const b0 = [];
    const b1 = ["f"];
    const b2 = [0];
    const b3 = [0, "f"];

    const s = schema([string, number]);

    assert(s.validate(g0)).equals(g0);

    assert(() => s.validate(b0)).throws(expect("s", undefined, "[0]"));
    assert(() => s.validate(b1)).throws(expect("n", undefined, "[1]"));
    assert(() => s.validate(b2)).throws(expect("s", 0, "[0]"));
    assert(() => s.validate(b3)).throws(expect("s", 0, "[0]"));
  });
}
