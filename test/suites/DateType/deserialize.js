import {Test} from "debris";

const test = new Test();

test.case("Date objects are returned", (assert, {"types": {DateType}}) => {
  const date = new Date();
  assert(DateType.deserialize(date)).same(date);
});

test.case("strings are constructed with new Date()", (assert, fixtures) => {
  const {types: {DateType}} = fixtures;
  const date = new Date();
  assert(DateType.deserialize(date.toString())).equals(date);
});

export default test;
