import Int16 from "./Int16.js";

const coerced = value => Int16.validate(Int16.coerce(value));

export default test => {
  test.case("empty", assert => {
    assert(Int16.validate()).false();
  });
  test.case("invalid types", assert => {
    assert(Int16.validate(1n)).false();
    assert(Int16.validate(true)).false();
    assert(Int16.validate({})).false();
    assert(Int16.validate(null)).false();
    assert(Int16.validate([])).false();
  });
  test.case("range", assert => {
    assert(Int16.validate(0)).true();
    assert(Int16.validate(-0)).true();
    assert(Int16.validate(1)).true();
    assert(Int16.validate(-1)).true();
    assert(Int16.validate(32_767)).true();
    assert(Int16.validate(-32_768)).true();

    assert(Int16.validate(32_768)).false();
    assert(Int16.validate(-32_769)).false();
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
