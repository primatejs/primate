import number from "./number.js";
import boolean from "./boolean.js";
import object from "./object.js";
import {reassert} from "./common.spec.js";

export default test => {
  reassert(test, object);

  test.case("fail", ({fail}) => {
    fail(undefined, [], "True", "False");
  });
  test.case("same", ({same}) => {
    same({}, Object(), new Object());
  });

  test.case("of", ({assert}) => {
    const o = object.of({
      age: number,
      pretty: boolean,
    });

    [undefined, [], "True", "False"].forEach(value => {
      assert(() => o.type(value)).throws();
    });
    [{}, Object(), new Object()].forEach(value => {
      assert(() => o.type(value)).not_throws();
    });
    assert(() => o.type({age: "twenty"})).throws("`twenty` is not a number");
    assert(() => o.type({pretty: "fals"})).throws("`fals` is not a boolean");
    assert(() => o.type({age: "twenty", pretty: "fals"}))
      .throws("`twenty` is not a number");
    assert(o.type({age: "20"})).equals({age: 20});
    assert(o.type({age: 20})).equals({age: 20});
    assert(o.type({pretty: "false"})).equals({pretty: false});
    assert(o.type({pretty: false})).equals({pretty: false});
    assert(o.type({age: "20", pretty: "false"}))
      .equals({age: 20, pretty: false});
  });
};
