export default test => {
  test.case("by id: without parameters", async (assert, {Person}) => {
    assert(await Person.by_id()).undefined();
  });

  test.case("by id: Domain instance when found", async (assert, fixtures) => {
    const {mowgli, Person} = fixtures;
    await mowgli.save();
    const found_mowgli = await Person.by_id(mowgli._id);
    assert(found_mowgli).instanceof(Person);
    assert(found_mowgli._id).equals(mowgli._id);
  });

  test.case("by id: supports Eager", async (assert, {mowgli, Person}) => {
    await mowgli.save();
    const found_mowgli = Person.by_id(mowgli._id);
    assert(await found_mowgli.name).equals("Mowgli");
  });

  test.case("by id: deserializes storables", async (assert, fixtures) => {
    const {mowgli, Person} = fixtures;
    mowgli.local_house = {name: "Jungle", location: "Asia"};
    await mowgli.save();
    const {local_house} = await Person.by_id(mowgli._id);
    assert(local_house).equals(mowgli.local_house);
  });

  test.case("collection: equals class name", (assert, {Person}) => {
    assert(Person.collection).equals("person");
  });

  test.case("constructor: optional `document`", async (assert, fixtures) => {
    const {empty, mowgli} = fixtures;
    assert(await empty.name).undefined();
    assert(mowgli.name).equals("Mowgli");
  });

  test.case("find: empty array when none found", async (assert, {Animal}) => {
    const animals = await Animal.find({name: "Not Raksha"});
    assert(animals).equals([]);
  });

  test.case("find: all without criteria", async (assert, {Animal}) => {
    const raksha = new Animal({name: "Raksha4", female: true});
    const baloo = new Animal({name: "Baloo2", male: true});
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

  test.case("find: some with criteria", async (assert, {Animal}) => {
    const raksha = new Animal({name: "Raksha5", female: true});
    const baloo = new Animal({name: "Baloo3", male: true});
    await raksha.save();
    await baloo.save();
    const just_raksha = await Animal.find({name: "Raksha5"});
    assert(just_raksha.length).equals(1);
    assert(just_raksha[0].name).equals("Raksha5");

    const just_baloo = await Animal.find({name: "Baloo3"});
    assert(just_baloo.length).equals(1);
    assert(just_baloo[0].name).equals("Baloo3");

  });

  test.case("find: deserializes storebles", async (assert, {Person}) => {
    const local_house = {name: "Jungle", location: "Asia"};
    const male = true;
    const mowgli = new Person({name: "Mowgli", male, local_house});
    await mowgli.save();
    const [found_mowgli] = await Person.find();
    assert(found_mowgli.local_house).equals(local_house);
  });

  test.case("first: undefined when none is found", async (assert, {Person}) => {
    const person = await Person.first({name: "Not Mowgli"});
    assert(person).undefined();
  });

  test.case("first: a Domain instance when found", async (assert, fixtures) => {
    const {mowgli, Person} = fixtures;
    await mowgli.save();
    const found_mowgli = await Person.first({_id: mowgli._id});
    assert(found_mowgli).instanceof(Person);
    assert(found_mowgli._id).equals(mowgli._id);
  });

  test.case("first: supports Eager", async (assert, {mowgli, Person}) => {
    await mowgli.save();
    const found_mowgli = Person.first({_id: mowgli._id});
    assert(await found_mowgli.name).equals("Mowgli");
  });

  test.case("first: deserializes storables", async (assert, fixtures) => {
    const {mowgli, Person} = fixtures;
    mowgli.local_house = {name: "Jungle", location: "Asia"};
    await mowgli.save();
    const {local_house} = await Person.one({_id: mowgli._id});
    assert(local_house).equals(mowgli.local_house);
  });

  test.case("one: undefined when none is found", async (assert, {Person}) => {
    const person = await Person.one({name: "Not Mowgli"});
    assert(person).undefined();
  });

  test.case("one: uses string param as id", async (assert, {mowgli, Person}) => {
    await mowgli.save();
    const found_mowgli = await Person.one(mowgli._id);
    const found_mowgli_by_id = await Person.by_id(mowgli._id);
    assert(found_mowgli._id).equals(found_mowgli_by_id._id);
  });

  test.case("one: uses object param as criteria", async (assert, fixtures) => {
    const {mowgli, Person} = fixtures;
    await mowgli.save();
    const found_mowgli = await Person.one({_id: mowgli._id});
    const found_mowgli_by_criteria = await Person.first({_id: mowgli._id});
    assert(found_mowgli._id).equals(found_mowgli_by_criteria._id);
  });

  test.case("one: deserializes storables", async (assert, fixtures) => {
    const {mowgli, Person} = fixtures;
    mowgli.local_house = {name: "Jungle", location: "Asia"};
    await mowgli.save();
    const {local_house} = await Person.one({_id: mowgli._id});
    assert(local_house).equals(mowgli.local_house);
  });

  test.case("properties: contains _id", (assert, {empty: {properties}}) => {
    assert(properties.length).atleast(1);
    assert(properties.includes("_id")).true();
  });

  test.case("store_file: `default.js` unless overwritten", (assert, {Person}) => {
    assert(Person.store_file).equals("default.js");
  });

  test.case("store: associated with domain", (assert, {Person, MemoryStore}) => {
    assert(Person.store).instanceof(MemoryStore);
  });
};
