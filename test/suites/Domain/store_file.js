import {Test} from "debris";

const test = new Test();

test.case("is `default.js` unless overwritten", (assert, {Person}) => {
  assert(Person.store_file).equals("default.js");
});

export default test;
