import {Test} from "debris";

const test = new Test();

test.case("returns empty array when none found", async (assert, {Animal}) => {
  const animals = await Animal.find({"name": "Not Raksha"});
  assert(animals).equals([]);
});

test.case("finds all without criteria", async (assert, {Animal}) => {
  const raksha = new Animal({"name": "Raksha4", "female": true});
  const baloo = new Animal({"name": "Baloo2", "male": true});
  await raksha.save();
  await baloo.save();
  const animals = await Animal.find();
  const two = 2;
  assert(animals.length).equals(two);
  assert(animals[0].name).equals("Raksha4");
  assert(animals[0].female).equals(true);
  assert(animals[1].name).equals("Baloo2");
  assert(animals[1].male).equals(true);
});

test.case("finds some with criteria", async (assert, {Animal}) => {
  const raksha = new Animal({"name": "Raksha5", "female": true});
  const baloo = new Animal({"name": "Baloo3", "male": true});
  await raksha.save();
  await baloo.save();
  const just_raksha = await Animal.find({"name": "Raksha5"});
  assert(just_raksha.length).equals(1);
  assert(just_raksha[0].name).equals("Raksha5");

  const just_baloo = await Animal.find({"name": "Baloo3"});
  assert(just_baloo.length).equals(1);
  assert(just_baloo[0].name).equals("Baloo3");

});

test.case("deserializes custom storeables", async (assert, {Person}) => {
  const local_house = {"name": "Jungle", "location": "Asia"};
  const male = true;
  const mowgli = new Person({"name": "Mowgli", male, local_house});
  await mowgli.save();
  const [found_mowgli] = await Person.find();
  assert(found_mowgli.local_house).equals(local_house);
});

export default test;
