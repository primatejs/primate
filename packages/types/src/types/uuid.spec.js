import uuid from "./uuid.js";

export default test => {
  test.case("empty", assert => {
    assert(() => uuid()).throws();
    assert(() => uuid("")).throws();
  });
  test.case("invalid types", assert => {
    assert(() => uuid(1)).throws();
    assert(() => uuid(true)).throws();
    assert(() => uuid({})).throws();
    assert(() => uuid(null)).throws();
    assert(() => uuid([])).throws();
  });
  test.case("case", assert => {
    const value = "4d0996db-BDA9-4f95-ad7c-7075b10d4ba6";
    assert(uuid(value)).equals(value);
    assert(uuid(value.toUpperCase())).equals(value.toUpperCase());
    assert(uuid(value.toLowerCase())).equals(value.toLowerCase());
  });
  test.case("invalid characters", assert => {
    assert(() => uuid("4d0996 b-BDA9-4f95-ad7c-7075b10d4ba6")).throws();
    assert(() => uuid("4d0996db-BD$9-4f95-ad7c-7075b10d4ba6")).throws();
    assert(() => uuid("4d0996db-BDA9-%f95-ad7c-7075b10d4ba6")).throws();
  });
};
