import {Test} from "debris";

const test = new Test();

test.case("returns undefined when none is found", async (assert, {Person}) => {
  const person = await Person.one({"name": "Not Mowgli"});
  assert(person).undefined();
});

test.case("uses string parameter as id", async (assert, {mowgli, Person}) => {
  await mowgli.save();
  const found_mowgli = await Person.one(mowgli._id);
  const found_mowgli_by_id = await Person.by_id(mowgli._id);
  assert(found_mowgli._id).equals(found_mowgli_by_id._id);
});

test.case("uses object parameter as criteria", async (assert, fixtures) => {
  const {mowgli, Person} = fixtures;
  await mowgli.save();
  const found_mowgli = await Person.one({"_id": mowgli._id});
  const found_mowgli_by_criteria = await Person.first({"_id": mowgli._id});
  assert(found_mowgli._id).equals(found_mowgli_by_criteria._id);
});

test.case("deserializes custom storeables", async (assert, fixtures) => {
  const {mowgli, Person} = fixtures;
  mowgli.local_house = {"name": "Jungle", "location": "Asia"};
  await mowgli.save();
  const {local_house} = await Person.one({"_id": mowgli._id});
  assert(local_house).equals(mowgli.local_house);
});

export default test;
