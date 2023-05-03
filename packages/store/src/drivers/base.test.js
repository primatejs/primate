export default (driver, lifecycle) => test => {
  const init = async (db = driver()) => {
    const _db = await db;
    return Object.fromEntries(Object.keys(_db).map(operation =>
      [operation, (...args) => _db[operation](...args)]
    ));
  };

  test.lifecycle(lifecycle);

  test.case("empty collection", async assert => {
    const {count} = await init();
    await assert(await count("user")).equals(0);
    await assert(await count("comment")).equals(0);
  });
  test.case("primary", async assert => {
    const {primary} = await init();
    const {validate, generate} = await primary();
    await assert(validate(generate())).true();
  });
  test.case("insert/count", async assert => {
    const {insert, count} = await init();
    await insert("user", {id: "1"}) ;
    await assert(await count("user")).equals(1);
    await assert(await count("comment")).equals(0);
    await insert("user", {id: "1"}) ;
    await assert(await count("user")).equals(1 + 1);
    await assert(await count("comment")).equals(0);
  });
  test.case("get", async assert => {
    const {insert, get} = await init();
    await insert("user", {id: "1"}) ;
    await assert(await get("user", "id", "1")).equals({id: "1"});
  });
  test.case("find", async assert => {
    const {insert, find} = await init();
    const user1 = {id: "1", name: "Donald", sex: "M"};
    const user2 = {id: "2", name: "Donald", sex: "M"};
    const user3 = {id: "3", name: "Ryan", sex: "M"};
    await insert("user", user1);
    await insert("user", user2);
    await insert("user", user3);
    await assert(await find("user", {name: "Donald"})).equals([user1, user2]);
    await assert(await find("user", {name: "Ryan"})).equals([user3]);
    await assert(await find("user", {sex: "M"})).equals([user1, user2, user3]);
    await assert(await find("user", {sex: "F"})).equals([]);
    await assert(await find("user")).equals([user1, user2, user3]);
  });
  test.case("update", async assert => {
    const {update, get, insert, count} = await init();
    const user1 = {id: "1", name: "Donald"};
    const user2 = {id: "2", name: "Donald"};
    await insert("user", user1);
    await insert("user", user2);
    await update("user", {id: "1"}, {id: "1", name: "Ryan"});
    await assert(await count("user")).equals(1 + 1);
    await assert(await get("user", "id", "1")).equals({id: "1", name: "Ryan"});
    await assert(await get("user", "id", "2")).equals(user2);
    await update("user", {name: "Ryan"}, {id: "1", name: "Donald"});
    await assert(await get("user", "id", "1")).equals(user1);
    await assert(await get("user", "id", "2")).equals(user2);
  });
  test.case("delete", async assert => {
    const {insert, count, get, delete: $delete} = await init();
    const user1 = {id: "1", name: "Donald"};
    const user2 = {id: "2", name: "Donald"};
    await insert("user", user1);
    await insert("user", user2);
    await $delete("user", {id: "1"});
    await assert(await count("user")).equals(1);
    await assert(await get("user", "id", "2")).equals(user2);
    await $delete("user", {id: "1"});
    await assert(await count("user")).equals(1);
    await $delete("user", {id: "2"});
    await assert(await count("user")).equals(0);
  });
  test.case("transactions", async assert => {
    const {start, rollback, commit, end, insert, count} = await init();
    const error = "no transaction, use `start` first";
    assert(() => rollback()).throws(error);
    assert(() => commit()).throws(error);
    assert(() => end()).throws(error);
    await start();
    assert(() => start()).throws("already in transaction, use `end` first");
    const user1 = {id: "1", name: "Donald"};
    const user2 = {id: "2", name: "Donald"};
    await insert("user", user1);
    // seeing changes
    await assert(await count("user")).equals(1);
    // changes discarded
    await rollback();
    await assert(await count("user")).equals(0);

    await insert("user", user2);
    await commit();
    await rollback();
    // changes not discarded due to commit
    await assert(await count("user")).equals(1);

    await insert("user", user2);
    await rollback();
    // changes not discarded due to commit
    await assert(await count("user")).equals(1);

    await end();
    assert(() => rollback()).throws(error);
    assert(() => commit()).throws(error);
    assert(() => end()).throws(error);
  });
};
