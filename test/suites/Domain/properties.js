import {Test} from "debris";

const test = new Test();

test.case("contains _id", (assert, {"empty": {properties}}) => {
  assert(properties.length).atleast(1);
  assert(properties.includes("_id")).true();
});

export default test;
