import {Test} from "debris";

const test = new Test();

test.case("inserts when _id isn't set", async (assert, {mowgli, Person}) => {
  assert(await Person.count({"name": "Mowgli"})).equals(0);
  await mowgli.save();
  assert(await Person.count({"name": "Mowgli"})).equals(1);
  assert(await Person.one(mowgli._id)).equals(mowgli);
});

test.case("updates when _id is set", async (assert, {mowgli, Person}) => {
  await mowgli.save();
  assert(mowgli._id).defined();
  assert(await Person.count({"_id": mowgli._id})).equals(1);
  mowgli.age = 6;
  await mowgli.save();
  assert(await Person.count({"_id": mowgli._id})).equals(1);
  assert(await Person.one(mowgli._id)).equals(mowgli);
});

test.case("without Domain.fields overwritten", async (assert, fixtures) => {
  const {empty, Empty} = fixtures;
  await empty.save();
  assert(await Empty.one(empty._id)).equals(empty);
});

test.case("serializes custom storeables", async (assert, {mowgli, Person}) => {
  mowgli.local_house = {"name": "Jungle", "location": "Asia"};
  await mowgli.save();

  // can't use `find` here as it would backdeserialize it
  const [{local_house}] = Person._store.collections.person;
  assert(local_house).equals("Jungle in Asia");
});

export default test;
