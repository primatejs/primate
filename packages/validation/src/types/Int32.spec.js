import Int32 from "./Int32.js";

const coerced = value => Int32.validate(Int32.coerce(value));

export default test => {
  test.case("empty", assert => {
    assert(Int32.validate()).false();
  });
  test.case("invalid types", assert => {
    assert(Int32.validate(1n)).false();
    assert(Int32.validate(true)).false();
    assert(Int32.validate({})).false();
    assert(Int32.validate(null)).false();
    assert(Int32.validate([])).false();
  });
  test.case("range", assert => {
    assert(Int32.validate(0)).true();
    assert(Int32.validate(-0)).true();
    assert(Int32.validate(1)).true();
    assert(Int32.validate(-1)).true();
    assert(Int32.validate(2_147_483_647)).true();
    assert(Int32.validate(-2_147_483_648)).true();

    assert(Int32.validate(2_147_483_648)).false();
    assert(Int32.validate(-2_147_483_649)).false();
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
    assert(coerced("1n")).false();
    assert(coerced(true)).false();
  });
};
