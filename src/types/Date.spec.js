import {DateType} from "./types.js";

export default test => {
  test.case("Date objects are returned", assert => {
    const date = new Date();
    assert(DateType.deserialize(date)).same(date);
  });

  test.case("strings are constructed with new Date()", assert => {
    const date = new Date();
    assert(DateType.deserialize(date.toString())).equals(date);
  });
};
