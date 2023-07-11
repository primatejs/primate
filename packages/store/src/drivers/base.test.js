import {identity} from "runtime-compat/function";

export default async (test, driver, lifecycle) => {
  test.lifecycle(lifecycle);
  const e = () => ({traits: {height: 60, weight: 70}});
  const i = ({embedded = {in: identity, out: identity}} = {}) => {
    return {traits: embedded.in({height: 60, weight: 70})};
  };
  const o = (document, {embedded = {in: identity, out: identity}} = {}) => {
    return {
      ...document,
      traits: embedded.out(document.traits),
    };
  };

  test.case("empty collection", async assert => {
    const {count} = await driver();
    await assert(await count("user")).equals(0);
    await assert(await count("comment")).equals(0);
  });
  test.case("insert/count", async assert => {
    const {insert, count, types} = await driver();
    await insert("user", "id", {});
    assert(await count("user")).equals(1);
    assert(await count("comment")).equals(0);
    await insert("user", "id", {});
    assert(await count("user")).equals(2);
    assert(await count("comment")).equals(0);
    /* embedded */
    await insert("user", "id", i(types));
    assert(await count("user")).equals(3);
  });
  test.case("get", async assert => {
    const {insert, get, types} = await driver();
    const result = await insert("user", "id", {});
    assert(await get("user", "id", result.id)).equals({id: result.id});

    /* embedded */
    const {id} = await insert("user", "id", i(types));
    const r = await get("user", "id", id);
    assert(o(r, types)).equals({id, ...e(types)});
  });
  test.case("find", async assert => {
    const {insert, find, types} = await driver();
    const user1 = {name: "Donald", sex: "M"};
    const user2 = {name: "Donald", sex: "M"};
    const user3 = {name: "Ryan", sex: "M"};
    await insert("user", "id", user1);
    await insert("user", "id", user2);
    await insert("user", "id", user3);
    assert(await find({}, "user", {name: "Donald"})).equals([user1, user2]);
    assert(await find({}, "user", {name: "Ryan"})).equals([user3]);
    assert(await find({}, "user", {sex: "M"})).equals([user1, user2, user3]);
    assert(await find({}, "user", {sex: "F"})).equals([]);
    assert(await find({}, "user")).equals([user1, user2, user3]);

    /* embedded */
    const {id} = await insert("user", "id", i(types));
    assert(await find("user", "id", {id})).equals([{id, ...e(types)}]);
  });
  test.case("update", async assert => {
    const {update, get, insert, count, types} = await driver();
    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    const r1 = await insert("user", "id", user1);
    const r2 = await insert("user", "id", user2);
    await update("user", {id: r1.id}, {id: r1.id, name: "Ryan"});
    assert(await count("user")).equals(1 + 1);
    assert(await get("user", "id", r1.id)).equals({id: r1.id,
      name: "Ryan"});
    assert(await get("user", "id", r2.id)).equals(user2);
    await update("user", {name: "Ryan"}, {id: r1.id, name: "Donald"});
    assert(await get("user", "id", r1.id)).equals(user1);
    assert(await get("user", "id", r2.id)).equals(user2);

    /* embedded */
    await update("user", {name: "Donald"}, {id: r1.id, name: "Donald",
      ...i(types)});
    assert(await get("user", "id", r1.id)).equals({id: r1.id, name: "Donald",
      ...e(types)});
  });
  test.case("delete", async assert => {
    const {insert, count, get, delete: $delete} = await driver();
    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    const r1 = await insert("user", "id", user1);
    const r2 = await insert("user", "id", user2);
    await $delete("user", {id: r1.id});
    assert(await count("user")).equals(1);
    assert(await get("user", "id", r2.id)).equals(user2);
    await $delete("user", {id: r1.id});
    assert(await count("user")).equals(1);
    await $delete("user", {id: r2.id});
    assert(await count("user")).equals(0);
  });
  test.case("transactions", async assert => {
    const {start, rollback, commit, end, insert, count} = await driver();
    const error = "no transaction, use `start` first";
    assert(() => rollback()).throws(error);
    assert(() => commit()).throws(error);
    assert(() => end()).throws(error);
    await start();
    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    await insert("user", "id", user1);
    // seeing changes
    await assert(await count("user")).equals(1);
    // changes discarded
    await rollback();
    await assert(await count("user")).equals(0);

    await insert("user", "id", user2);
    await commit();
    await rollback();
    // changes not discarded due to commit
    await assert(await count("user")).equals(1);

    await insert("user", "id", user2);
    await rollback();
    // changes not discarded due to commit
    await assert(await count("user")).equals(1);

    await end();
    assert(() => rollback()).throws(error);
    assert(() => commit()).throws(error);
    assert(() => end()).throws(error);
  });
};
