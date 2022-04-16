import {Test} from "debris";

const test = new Test();

test.case("equals class name", (assert, {Person}) => {
  assert(Person.collection).equals("person");
});

export default test;
