import {Test} from "debris";

const test = new Test();

test.case("resolves like a normal promise", async (assert, {EagerPromise}) => {
  assert(await new EagerPromise(resolve => resolve(1))).equals(1);
});

test.case("rejects like a normal promise", (assert, {EagerPromise}) => {
  assert(() => new EagerPromise((resolve, reject) =>
    reject({"message": 1}))).throws(1);
});

test.case("accessed depth 2", async (assert, {EagerPromise}) => {
  const object = Promise.resolve({"test": "test2"});
  const eager = EagerPromise.resolve(object);
  assert(await eager.test).equals("test2");
});

test.case("accessed depth 3", async (assert, {EagerPromise}) => {
  const object2 = Promise.resolve({"test2": "test3"});
  const object = Promise.resolve({"test": object2});
  const eager = EagerPromise.resolve(object);
  assert(await eager.test.test2).equals("test3");
});

test.case("accessed function", async (assert, {EagerPromise}) => {
  const func = () => ({});
  func.test = "test2";
  const object = Promise.resolve(func);
  const eager = EagerPromise.resolve(object);
  assert(await eager.test).equals("test2");
});

test.case("accessed linked domains", async (assert, fixtures) => {
  const {EagerPromise, Person, Animal, House} = fixtures;
  const jungle = new House({"name": "Jungle", "location": "India"});
  await jungle.save();
  const raksha = new Animal({"name": "Raksha", "female": true});
  raksha.house_id = jungle._id;
  await raksha.save();
  const mowgli = new Person({"name": "Mowgli"});
  mowgli.mother_id = raksha._id;
  const eager_mowgli = EagerPromise.resolve(mowgli);
  assert(await eager_mowgli.mother.house.name).equals("Jungle");
  assert(await eager_mowgli.mother.name).equals("Raksha");
});

test.case("accessed linked domains, getter", async (assert, fixtures) => {
  const {EagerPromise, Person, Animal} = fixtures;
  const raksha = new Animal({"name": "Raksha2", "female": true});
  await raksha.save();
  const mowgli = new Person({"name": "Mowgli"});
  mowgli.mother_id = raksha._id;
  const eager_mowgli = EagerPromise.resolve(mowgli);
  assert(await eager_mowgli.mother.howl()).equals("Raksha2 is howling");
});

test.case("accessed linked domains, function", async (assert, fixtures) => {
  const {EagerPromise, Person, Animal} = fixtures;
  const raksha = new Animal({"name": "Raksha3", "female": true});
  await raksha.save();
  const mowgli = new Person({"name": "Mowgli"});
  mowgli.mother_id = raksha._id;
  const eager_mowgli = EagerPromise.resolve(mowgli);
  assert(await eager_mowgli.get_mother().howl()).equals("Raksha3 is howling");
});

test.case("called with a promised function", async (assert, {EagerPromise}) => {
  const object = Promise.resolve(() => ({"test": "test2"}));
  const eager = EagerPromise.resolve(object);
  assert(await eager().test).equals("test2");
});

test.case("called with a promised non-function", async (assert, fixtures) => {
  const {EagerPromise} = fixtures;
  const object = Promise.resolve({"test": "test2"});
  const eager = EagerPromise.resolve(object);
  assert(await eager().test).equals("test2");
});

export default test;
