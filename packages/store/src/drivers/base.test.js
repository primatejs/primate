import {identity} from "runtime-compat/function";

const w = (document, id) => ({...document, id});

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

  test.reassert(async assert => {
    return {assert, ...await driver()};
  });

  test.case("empty collection", async ({assert, count}) => {
    await assert(await count("user")).equals(0);
    await assert(await count("comment")).equals(0);
  });
  test.case("insert", async ({assert, insert, count, types}) => {
    await insert("user", "id", {});
    assert(await count("user")).equals(1);
    assert(await count("comment")).equals(0);
    await insert("user", "id", {});
    assert(await count("user")).equals(2);
    assert(await count("comment")).equals(0);

    // embedded
    await insert("user", "id", i(types));
    assert(await count("user")).equals(3);
  });
  test.case("get", async ({assert, insert, get, types}) => {
    const result = await insert("user", "id", {});
    assert(await get("user", "id", result.id)).equals({id: result.id});

    // embedded
    const {id} = await insert("user", "id", i(types));
    const r = await get("user", "id", id);
    assert(o(r, types)).equals({id, ...e(types)});
  });
  test.case("find", async ({assert, insert, find, types}) => {
    const user1 = {name: "Donald", sex: "M"};
    const user2 = {name: "Donald", sex: "M"};
    const user3 = {name: "Ryan", sex: "M"};
    const {id: id1} = await insert("user", "id", user1);
    const {id: id2} = await insert("user", "id", user2);
    const {id: id3} = await insert("user", "id", user3);
    const user1$ = w(user1, id1);
    const user2$ = w(user2, id2);
    const user3$ = w(user3, id3);
    assert(await find("user", {name: "Donald"})).equals([user1$, user2$]);
    assert(await find("user", {name: "Ryan"})).equals([user3$]);
    assert(await find("user", {sex: "M"})).equals([user1$, user2$, user3$]);
    assert(await find("user", {sex: "F"})).equals([]);
    assert(await find("user")).equals([user1$, user2$, user3$]);

    // embedded
    const {id} = await insert("user", "id", i(types));
    const r = await find("user", {id});
    assert([o(r[0], types)]).equals([{id, ...e(types)}]);
  });
  test.case("count", async ({assert, insert, count}) => {
    const user1 = {name: "Donald", sex: "M"};
    const user2 = {name: "Donald", sex: "M"};
    const user3 = {name: "Ryan", sex: "M"};
    await insert("user", "id", user1);
    await insert("user", "id", user2);
    await insert("user", "id", user3);
    assert(await count("user", {name: "Donald"})).equals(2);
    assert(await count("user", {name: "Ryan"})).equals(1);
    assert(await count("user", {sex: "M"})).equals(3);
    assert(await count("user", {sex: "F"})).equals(0);
    assert(await count("user")).equals(3);
  });
  test.case("update", async ({assert, update, get, insert, count,
    delete: delete$, types}) => {

    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    const user3 = {name: "Donald", age: 34};

    // base {{{
    {
      const {id: id1} = await insert("user", "id", user1);
      const {id: id2} = await insert("user", "id", user2);

      const updated = await update("user", {id: id1}, {id: id1, name: "Ryan"});
      assert(updated).equals(1);
      // doesn't delete
      assert(await count("user")).equals(2);
      // only modifies documents adhering to criteria
      assert(await get("user", "id", id1)).equals({id: id1, name: "Ryan"});
      assert(await get("user", "id", id2)).equals(w(user2, id2));

      // empty collection
      await delete$("user");
    }
    // }}}
    // replacing {{{
    {
      const {id: id1} = await insert("user", "id", user1);
      const {id: id2} = await insert("user", "id", user3);
      assert(await update("user", {id: id2}, {id: id2, name: "Ryan"}))
        .equals(1);
      // only replaces given properties, leaves other intact
      assert(await get("user", "id", id2)).equals({id: id2, name: "Ryan",
        age: 34});

      assert(await update("user", {id: id2}, {id: id2, name: "Donald"}))
        .equals(1);
      // changes more than one
      assert(await update("user", {name: "Donald"}, {age: 20})).equals(2);

      assert(await get("user", "id", id1)).equals({id: id1, name: "Donald",
        age: 20});
      assert(await get("user", "id", id2)).equals({id: id2, name: "Donald",
        age: 20});

      assert(await update("user", {}, {name: "Ryan", age: 21})).equals(2);
      assert(await get("user", "id", id1)).equals({id: id1, name: "Ryan",
        age: 21});
      assert(await get("user", "id", id2)).equals({id: id2, name: "Ryan",
        age: 21});

      assert(await update("user", undefined, {name: "Donald"})).equals(2);
      assert(await get("user", "id", id1)).equals({id: id1, name: "Donald",
        age: 21});
      assert(await get("user", "id", id2)).equals({id: id2, name: "Donald",
        age: 21});

      // empty collection
      await delete$("user");
    }
    // }}}
    // null removal {{{
    {
      const {id} = await insert("user", "id", user3);
      assert(await update("user", {id}, {id, name: null})).equals(1);

      // null removes
      assert(await get("user", "id", id)).equals({id, age: 34});
    }
    // }}}
    // embedded {{{
    {
      const {id: id1} = await insert("user", "id", user1);
      assert(await update("user", {name: "Donald"}, {id: id1, name: "Donald",
        ...i(types)})).equals(1);
      assert(o(await get("user", "id", id1), types))
        .equals({id: id1, name: "Donald", ...e(types)});
    }
    // }}}
  });
  test.case("delete", async ({assert, insert, count, get, delete: delete$}) => {
    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    const {id: id1} = await insert("user", "id", user1);
    const {id: id2} = await insert("user", "id", user2);
    const user2$ = w(user2, id2);

    // reduces count
    // only deletes specified entries
    assert(await delete$("user", {id: id1})).equals(1);
    assert(await count("user")).equals(1);
    assert(await get("user", "id", id2)).equals(user2$);

    // no matching criteria is a noop
    assert(await delete$("user", {id: id1})).equals(0);
    assert(await count("user")).equals(1);

    // works with different criteria
    assert(await delete$("user", {id: id2})).equals(1);
    assert(await count("user")).equals(0);

    // no criteria removes everything
    await insert("user", "id", user1);
    await insert("user", "id", user1);
    assert(await count("user")).equals(2);
    assert(await delete$("user")).equals(2);
    assert(await count("user")).equals(0);

    // removes more than one entry
    await insert("user", "id", user1);
    await insert("user", "id", user1);
    assert(await count("user")).equals(2);
    assert(await delete$("user", user1)).equals(2);
    assert(await count("user")).equals(0);
  });
  test.case("transactions", async ({assert, start, rollback, commit, end,
    insert, count}) => {
    assert(() => rollback()).throws();
    assert(() => commit()).throws();
    await start();
    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    await insert("user", "id", user1);
    // seeing changes
    await assert(await count("user")).equals(1);
    // changes discarded, transaction ended
    await rollback();
    /* noop in some drivers, needed in others */
    await end();
    await assert(await count("user")).equals(0);

    // new transaction
    await start();
    await insert("user", "id", user2);
    await commit();
    /* noop in some drivers, needed in others */
    await end();
    assert(() => rollback()).throws();
    // changes not discarded due to commit
    await assert(await count("user")).equals(1);

    // new transaction
    await start();
    await insert("user", "id", user2);
    await rollback();
    /* noop in some drivers, needed in others */
    await end();
    // changes not discarded due to commit
    await assert(await count("user")).equals(1);

    assert(() => rollback()).throws();
    assert(() => commit()).throws();
  });
};
