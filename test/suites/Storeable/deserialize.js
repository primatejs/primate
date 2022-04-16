import {Test} from "debris";

const test = new Test();

test.case("noop", (assert, {Storeable}) => {
  assert(Storeable.deserialize("Mowgli")).equals("Mowgli");
});

test.case("overriden in derivatives", (assert, {LocalHouse}) => {
  const deserialized = {"name": "Jungle", "location": "Asia"};
  assert(LocalHouse.deserialize("Jungle in Asia")).equals(deserialized);
});

export default test;
