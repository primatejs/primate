import {transform} from "runtime-compat/object";
import {primary, string, object, u8, boolean, i64, date}  from "@primate/types";
import bases from "../bases.js";

const w = (document, id) => ({...document, id});

const schema = {
  id: primary,
  name: string,
  sex: string,
  traits: object,
  age: u8,
  smart: boolean,
  money: i64,
  created: date,
  from: string,
};

/* stolen from wrap.js */
const wrap = to => (types, document) => document === undefined
  ? document
  : transform(document, entry => entry.map(([field, value]) =>
    [field, types[bases[schema[field].base]][to](value)]));
const i = wrap("in");
const o = wrap("out");

const traits = {traits: {height: 60, weight: 70}};

export default async (test, driver, lifecycle) => {
  test.lifecycle(lifecycle);

  test.reassert(async assert => {
    const d = await driver();
    const {types, exists, start, rollback, commit, end} = d;
    const [user, comment] = ["user", "comment"].map(name => ({
      insert: document => d.insert(name, "id", i(types, document)),
      update: (criteria, delta) => d.update(name, criteria, i(types, delta)),
      count: criteria => d.count(name, criteria),
      get: async id => o(types, await d.get(name, "id", id)),
      find: async criteria => (await d.find(name, criteria))
        .map(document => o(types, document)),
      delete: criteria => d.delete(name, criteria),
      exists: () => d.exists(name),
    }));
    const transaction = {start, rollback, commit, end};
    return {assert, user, comment, transaction};
  });

  test.case("empty collection", async ({assert, user, comment}) => {
    await assert(await user.count()).equals(0);
    await assert(await comment.count()).equals(0);
  });
  test.case("insert", async ({assert, user, comment}) => {
    await user.insert({});
    assert(await user.count()).equals(1);
    assert(await comment.count()).equals(0);
    await user.insert({});
    assert(await user.count()).equals(2);
    assert(await comment.count()).equals(0);

    // embedded
    await user.insert({...traits});
    assert(await user.count()).equals(3);
  });
  test.case("get", async ({assert, user}) => {
    const result = await user.insert({});
    assert(await user.get(result.id)).equals({id: result.id});

    // empty get returns undefined
    assert(await user.get(300)).equals(undefined);

    const {id} = await user.insert({...traits});
    assert(await user.get(id)).equals({id, ...traits});
  });
  test.case("find", async ({assert, user}) => {
    const user1 = {name: "Donald", sex: "M"};
    const user2 = {name: "Donald", sex: "M"};
    const user3 = {name: "Ryan", sex: "M"};
    const {id: id1} = await user.insert(user1);
    const {id: id2} = await user.insert(user2);
    const {id: id3} = await user.insert(user3);
    const user1$ = w(user1, id1);
    const user2$ = w(user2, id2);
    const user3$ = w(user3, id3);
    assert(await user.find({name: "Donald"})).equals([user1$, user2$]);
    assert(await user.find({name: "Ryan"})).equals([user3$]);
    assert(await user.find({sex: "M"})).equals([user1$, user2$, user3$]);
    assert(await user.find({sex: "F"})).equals([]);
    assert(await user.find()).equals([user1$, user2$, user3$]);

    // embedded
    const {id} = await user.insert({...traits});
    assert(await user.find({id})).equals([{id, ...traits}]);
  });
  test.case("count", async ({assert, user}) => {
    const user1 = {name: "Donald", sex: "M"};
    const user2 = {name: "Donald", sex: "M"};
    const user3 = {name: "Ryan", sex: "M"};
    await user.insert(user1);
    await user.insert(user2);
    await user.insert(user3);
    assert(await user.count({name: "Donald"})).equals(2);
    assert(await user.count({name: "Ryan"})).equals(1);
    assert(await user.count({sex: "M"})).equals(3);
    assert(await user.count({sex: "F"})).equals(0);
    assert(await user.count()).equals(3);

  });
  test.case("update", async ({assert, user}) => {

    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    const user3 = {name: "Donald", age: 34};

    // base {{{
    {
      const {id: id1} = await user.insert(user1);
      const {id: id2} = await user.insert(user2);

      const updated = await user.update({id: id1}, {id: id1, name: "Ryan"});
      assert(updated).equals(1);
      // doesn't delete
      assert(await user.count()).equals(2);
      // only modifies documents adhering to criteria
      assert(await user.get(id1)).equals({id: id1, name: "Ryan"});
      assert(await user.get(id2)).equals(w(user2, id2));

      // empty collection
      await user.delete();
    }
    // }}}
    // replacing {{{
    {
      const {id: id1} = await user.insert(user1);
      const {id: id2} = await user.insert(user3);
      assert(await user.update({id: id2}, {id: id2, name: "Ryan"})).equals(1);
      // only replaces given properties, leaves other intact
      assert(await user.get(id2)).equals({id: id2, name: "Ryan", age: 34});

      assert(await user.update({id: id2}, {id: id2, name: "Donald"})).equals(1);
      // changes more than one
      assert(await user.update({name: "Donald"}, {age: 20})).equals(2);

      assert(await user.get(id1)).equals({id: id1, name: "Donald", age: 20});
      assert(await user.get(id2)).equals({id: id2, name: "Donald", age: 20});

      assert(await user.update({}, {name: "Ryan", age: 21})).equals(2);
      assert(await user.get(id1)).equals({id: id1, name: "Ryan", age: 21});
      assert(await user.get(id2)).equals({id: id2, name: "Ryan", age: 21});

      assert(await user.update(undefined, {name: "Donald"})).equals(2);
      assert(await user.get(id1)).equals({id: id1, name: "Donald", age: 21});
      assert(await user.get(id2)).equals({id: id2, name: "Donald", age: 21});

      // empty collection
      await user.delete();
    }
    // }}}
    // null removal {{{
    {
      const {id} = await user.insert(user3);
      assert(await user.update({id}, {id, name: null})).equals(1);

      // null removes
      assert(await user.get(id)).equals({id, age: 34});
    }
    // }}}
    // embedded {{{
    {
      const {id: id1} = await user.insert(user1);
      assert(await user.update({name: "Donald"}, {id: id1, name: "Donald",
        ...traits})).equals(1);
      assert(await user.get(id1)).equals({id: id1, name: "Donald", ...traits});
    }
    // }}}
  });
  test.case("delete", async ({assert, user}) => {
    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    const {id: id1} = await user.insert(user1);
    const {id: id2} = await user.insert(user2);
    const user2$ = w(user2, id2);

    // reduces count
    // only deletes specified entries
    assert(await user.delete({id: id1})).equals(1);
    assert(await user.count()).equals(1);
    assert(await user.get(id2)).equals(user2$);

    // no matching criteria is a noop
    assert(await user.delete({id: id1})).equals(0);
    assert(await user.count()).equals(1);

    // works with different criteria
    assert(await user.delete({id: id2})).equals(1);
    assert(await user.count()).equals(0);

    // no criteria removes everything
    await user.insert(user1);
    await user.insert(user1);
    assert(await user.count()).equals(2);
    assert(await user.delete()).equals(2);
    assert(await user.count()).equals(0);

    // removes more than one entry
    await user.insert(user1);
    await user.insert(user1);
    assert(await user.count()).equals(2);
    assert(await user.delete(user1)).equals(2);
    assert(await user.count()).equals(0);
  });
  test.case("transactions", async ({assert, transaction, user}) => {
    const {start, rollback, commit, end} = transaction;

    assert(() => rollback()).throws();
    assert(() => commit()).throws();
    await start();
    const user1 = {name: "Donald"};
    const user2 = {name: "Donald"};
    await user.insert(user1);
    // seeing changes
    await assert(await user.count()).equals(1);
    // changes discarded, transaction ended
    await rollback();
    // noop in some drivers, needed in others
    await end();
    await assert(await user.count()).equals(0);

    // new transaction
    await start();
    await user.insert(user2);
    await commit();
    // noop in some drivers, needed in others
    await end();
    assert(() => rollback()).throws();
    // changes not discarded due to commit
    await assert(await user.count()).equals(1);

    // new transaction
    await start();
    await user.insert(user2);
    await rollback();
    // noop in some drivers, needed in others
    await end();
    // changes not discarded due to commit
    await assert(await user.count()).equals(1);

    assert(() => rollback()).throws();
    assert(() => commit()).throws();
  });

  test.case("types", async ({assert, user}) => {
    const user1 = {
      name: "Donald",
      sex: "M",
      traits: {...traits},
      age: 30,
      smart: true,
      money: 1_000_000n,
      created: new Date(),
    };

    const {id} = await user.insert(user1);
    assert(await user.get(id)).equals({id, ...user1, traits: {...traits}});
  });

  test.case("reserved keywords", async ({assert, user}) => {
    const user1 = {
      from: "test",
    };

    const {id} = await user.insert(user1);
    assert(await user.get(id)).equals({id, ...user1});

    await user.update({id}, {from: "test2"});
    assert((await user.find({id}))[0]).equals({id, from: "test2"});

    await user.delete({from: "test2"});
    assert(await user.count()).equals(0);
  });

  test.case("exists", async ({assert, user, comment}) => {
    await user.insert({});
    assert(await user.exists()).true();
  });
};
