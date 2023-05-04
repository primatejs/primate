import Int64 from "./Int64.js";

const coerced = value => Int64.validate(Int64.coerce(value));

export default test => {
  test.case("empty", assert => {
    assert(Int64.validate()).false();
  });
  test.case("invalid types", assert => {
    assert(Int64.validate(1)).false();
    assert(Int64.validate(true)).false();
    assert(Int64.validate({})).false();
    assert(Int64.validate(null)).false();
    assert(Int64.validate([])).false();
  });
  test.case("range", assert => {
    assert(Int64.validate(0n)).true();
    assert(Int64.validate(-0n)).true();
    assert(Int64.validate(1n)).true();
    assert(Int64.validate(-1n)).true();
    assert(Int64.validate(9_223_372_036_854_775_807n)).true();
    assert(Int64.validate(-9_223_372_036_854_775_808n)).true();

    assert(Int64.validate(9_223_372_036_854_775_808n)).false();
    assert(Int64.validate(-9_223_372_036_854_775_809n)).false();
  });
  test.case("coerce", assert => {
    assert(coerced(0)).true();
    assert(coerced(-0)).true();
    assert(coerced(1)).true();
    assert(coerced(-1)).true();
    assert(coerced(1n)).true();
    assert(coerced(-1n)).true();
    assert(coerced("1")).true();
    assert(coerced("-1")).true();

    assert(coerced(1.1)).false();
    assert(coerced("1.0")).false();
    assert(coerced("1n")).false();
    assert(coerced(true)).false();
  });
};
