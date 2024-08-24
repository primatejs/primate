import boolean from "#boolean.js";
import number from "#number.js";
import object from "#object.js";
import { reassert } from "./common.spec.js";

export default test => {
  reassert(test, object);

  test.case("fail", ({ fail }) => {
    fail(undefined, [], "True", "False");
  });
  test.case("same", ({ same }) => {
    same({}, Object(), new Object());
  });

  test.case("of", ({ assert }) => {
    const o = object.of({
      age: number,
      pretty: boolean,
    });

    [undefined, [], "True", "False"].forEach(value => {
      assert(() => o.validate(value)).throws();
    });
    [{}, Object(), new Object()].forEach(value => {
      assert(() => o.validate(value)).nthrows();
    });
    assert(() => o.validate({ age: "twenty" }))
      .throws("`twenty` is not a number");
    assert(() => o.validate({ pretty: "fals" })).throws("`fals` is not a boolean");
    assert(() => o.validate({ age: "twenty", pretty: "fals" }))
      .throws("`twenty` is not a number");
    assert(o.validate({ age: "20" })).equals({ age: 20 });
    assert(o.validate({ age: 20 })).equals({ age: 20 });
    assert(o.validate({ pretty: "false" })).equals({ pretty: false });
    assert(o.validate({ pretty: false })).equals({ pretty: false });
    assert(o.validate({ age: "20", pretty: "false" }))
      .equals({ age: 20, pretty: false });
  });
};
