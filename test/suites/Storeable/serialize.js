import {Test} from "debris";

const test = new Test();

test.case("noop", (assert, {Storeable}) => {
  assert(Storeable.serialize("Mowgli")).equals("Mowgli");
});

test.case("overriden in derivatives", (assert, {LocalHouse}) => {
  const deserialized = {"name": "Jungle", "location": "Asia"};
  assert(LocalHouse.serialize(deserialized)).equals("Jungle in Asia");
});

export default test;
