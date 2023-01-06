export default test => {
  test.case("delete: deletes if _id found", async (assert, {baloo, Animal}) => {
    await baloo.save();
    const found_baloo = await Animal.one(baloo._id);
    assert(found_baloo._id).equals(baloo._id);
    await found_baloo.delete();
    const deleted_baloo = await Animal.one(baloo._id);
    assert(deleted_baloo).undefined();
  });

  test.case("errors: builtin", async (assert, {mowgli}) => {
    await mowgli.verify();
    assert(mowgli.errors.name).undefined();
    delete mowgli.name;
    await mowgli.verify();
    assert(mowgli.errors.name).equals("Must not be empty");
  });

  test.case("errors: with a parameter", async (assert, {mowgli}) => {
    await mowgli.verify();
    assert(mowgli.errors.name).undefined();
    mowgli.name = "Mowgli wolf-cub";
    await mowgli.verify();
    assert(mowgli.errors.name).equals("Must be 6 characters in length");
  });

  test.case("errors: with n parameters", async (assert, {mowgli}) => {
    await mowgli.save();
    assert(mowgli.errors.likes).undefined();
    mowgli.likes = "The entire jungle";
    await mowgli.save();
    assert(mowgli.errors.likes)
      .equals("Must be between 5 and 8 characters in length");
  });

  test.case("save: insert when _id unset", async (assert, {mowgli, Person}) => {
    assert(await Person.count({name: "Mowgli"})).equals(0);
    await mowgli.save();
    assert(await Person.count({name: "Mowgli"})).equals(1);
    assert(await Person.one(mowgli._id)).equals(mowgli);
  });

  test.case("save: update when _id is set",
    async (assert, {mowgli, Person}) => {
      await mowgli.save();
      assert(mowgli._id).defined();
      assert(await Person.count({_id: mowgli._id})).equals(1);
      mowgli.age = 6;
      await mowgli.save();
      assert(await Person.count({_id: mowgli._id})).equals(1);
      assert(await Person.one(mowgli._id)).equals(mowgli);
    });

  test.case("save: without overwritten `fields`", async (assert, fixtures) => {
    const {empty, Empty} = fixtures;
    await empty.save();
    assert(await Empty.one(empty._id)).equals(empty);
  });

  test.case("save: serializes storables", async (assert, {mowgli, Person}) => {
    mowgli.local_house = {name: "Jungle", location: "Asia"};
    await mowgli.save();

    // can't use `find` here as it would backdeserialize it
    const [{local_house}] = Person._store.collections.person;
    assert(local_house).equals("Jungle in Asia");
  });

  test.case("verify: verifies fields", async (assert, {mowgli}) => {
    mowgli.house_id = "1";
    await mowgli.verify();
    assert(mowgli.errors.house_id).equals("Must be a House");
  });
};
