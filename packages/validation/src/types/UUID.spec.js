import UUID from "./UUID.js";

export default test => {
  test.case("empty", assert => {
    assert(UUID.validate()).false();
    assert(UUID.validate("")).false();
  });
  test.case("invalid types", assert => {
    assert(UUID.validate(1)).false();
    assert(UUID.validate(true)).false();
    assert(UUID.validate({})).false();
    assert(UUID.validate(null)).false();
    assert(UUID.validate([])).false();
  });
  test.case("case", assert => {
    const uuid = "4d0996db-BDA9-4f95-ad7c-7075b10d4ba6";
    assert(UUID.validate(uuid)).true();
    assert(UUID.validate(uuid.toUpperCase())).true();
    assert(UUID.validate(uuid.toLowerCase())).true();
  });
  test.case("invalid characters", assert => {
    assert(UUID.validate("4d0996 b-BDA9-4f95-ad7c-7075b10d4ba6")).false();
    assert(UUID.validate("4d0996db-BD$9-4f95-ad7c-7075b10d4ba6")).false();
    assert(UUID.validate("4d0996db-BDA9-%f95-ad7c-7075b10d4ba6")).false();
  });
};
