import { mark } from "./Logger.js";
import dispatch from "./dispatch.js";

const number = (value, name) => {
  const n = Number(value);
  if (Number.isNaN(n)) {
    throw new Error(`\`${name}\` is not a number`);
  }
  return n;
};

const number2 = {
  validate(value, name) {
    const n = Number(value);
    if (Number.isNaN(n)) {
      throw new Error(`\`${name}\` is not a number`);
    }
    return n;
  },
};

export default test => {
  test.case("get", async assert => {
    const d = dispatch();
    assert(d(null).json()).equals(null);
    assert(d({}).json()).equals({});
    assert(d({ foo: "bar" }).json()).equals({ foo: "bar" });
    assert(d({ foo: "bar" }).get("foo")).equals("bar");
    assert(d({ foo: "bar", bar: "baz" }).json()).equals({ foo: "bar", bar: "baz" });
    assert(d({ foo: "bar", bar: "baz" }).get("foo")).equals("bar");
    assert(d({ foo: "bar", bar: "baz" }).get("bar")).equals("baz");
  });
  test.case("patch", async assert => {
    const d = dispatch({ number, number2 });
    const error = mark("mismatched type: {0}", "`foo` is not a number");
    assert(() => d({}).getNumber()).throws("`number` called without key");
    assert(() => d({}).getNumber2()).throws("`number2` called without key");
    assert(() => d({}).getNumber("foo")).throws(error);
    assert(() => d({}).getNumber2("foo")).throws(error);
    assert(() => d({ foo: "bar" }).getNumber("foo")).throws(error);
    assert(() => d({ foo: "bar" }).getNumber2("foo")).throws(error);
  });
};
