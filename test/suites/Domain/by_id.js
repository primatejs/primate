import {Test} from "debris";

const test = new Test();

test.case("returns undefined without parameters", async (assert, {Person}) => {
  assert(await Person.by_id()).undefined();
});

test.case("returns a Domain instance when found", async (assert, fixtures) => {
  const {mowgli, Person} = fixtures;
  await mowgli.save();
  const found_mowgli = await Person.by_id(mowgli._id);
  assert(found_mowgli).instanceof(Person);
  assert(found_mowgli._id).equals(mowgli._id);
});

test.case("supports EagerPromise", async (assert, {mowgli, Person}) => {
  await mowgli.save();
  const found_mowgli = Person.by_id(mowgli._id);
  assert(await found_mowgli.name).equals("Mowgli");
});

test.case("deserializes custom storeables", async (assert, fixtures) => {
  const {mowgli, Person} = fixtures;
  mowgli.local_house = {"name": "Jungle", "location": "Asia"};
  await mowgli.save();
  const {local_house} = await Person.by_id(mowgli._id);
  assert(local_house).equals(mowgli.local_house);
});

export default test;
