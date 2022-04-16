import {Test} from "debris";

const test = new Test();

test.case("associated with its domain", (assert, {Person, MemoryStore}) => {
  assert(Person.store).instanceof(MemoryStore);
});

export default test;
