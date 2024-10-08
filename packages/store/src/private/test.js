import boolean from "@primate/schema/boolean";
import date from "@primate/schema/date";
import i64 from "@primate/schema/i64";
import object from "@primate/schema/object";
import primary from "@primate/schema/primary";
import string from "@primate/schema/string";
import u8 from "@primate/schema/u8";

const w = (document, id) => ({ ...document, id });
const defaults = {
  mode: "loose",
  readonly: false,
  ambiguous: false,
};

const stores = [
  ["User", {
    name: "User",
    defaults,
    schema: {
      id: primary,
      name: string,
      sex: string,
      traits: object,
      age: u8,
      smart: boolean,
      money: i64,
      created: date,
      from: string,
    },
  }],
  ["StrictUser", {
    name: "StrictUser",
    defaults: {
      ...defaults,
      mode: "strict",
    },
    schema: {
      id: primary,
      name: string,
      sex: string,
      traits: object,
      age: u8,
      smart: boolean,
      money: i64,
      created: date,
      from: string,
    },
  }],
  ["Comment", {
    name: "Comment",
    defaults,
    schema: {
      id: primary,
    },
  }],
];

const traits = { traits: { height: 60, weight: 70 } };

export default async (test, driver, lifecycle) => {
  test.lifecycle({
    async before() {
      const d = await driver();
      await (await d.transact(stores))([], async store => {
        const { User, StrictUser, Comment } = Object.fromEntries(store);
        await User.schema.create(stores[0][1].schema);
        await StrictUser.schema.create(stores[1][1].schema);
        await Comment.schema.create(stores[2][1].schema);
      });
    },
    async after() {
      const d = await driver();
      await (await d.transact(stores))([], async store => {
        const { User, StrictUser, Comment } = Object.fromEntries(store);
        await User.schema.delete();
        await StrictUser.schema.delete();
        await Comment.schema.delete();
      });
      await lifecycle?.after();
    },
  });

  test.reassert(async assert => {
    const d = await driver();
    const t = await d.transact(stores);
    return {
      assert,
      t: async callback => {
        await t([], async store => {
          const { User, StrictUser, Comment } = Object.fromEntries(store);
          await callback({ User, StrictUser, Comment });
        });
      },
    };
  });

  test.case("empty collection", async ({ assert, t }) => {
    await t(async ({ User, Comment }) => {
      await assert(await User.count()).equals(0);
      await assert(await Comment.count()).equals(0);
    });
  });

  test.case("insert", async ({ assert, t }) => {
    await t(async ({ User, Comment }) => {
      const { id } = await User.insert({});
      assert(id).defined();

      await User.insert({ name: "Donald" });
      assert(await User.count()).equals(2);
      assert(await Comment.count()).equals(0);
      await User.insert({});
      assert(await User.count()).equals(3);
      assert(await Comment.count()).equals(0);

      // embedded
      await User.insert({ ...traits });
      assert(await User.count()).equals(4);
    });
  });

  test.case("insert[strict]", async ({ assert, t }) => {
    await t(async ({ StrictUser }) => {
      //assert(() => StrictUser.insert({})).throws();

      const { id } = await StrictUser.insert({
        name: "Bob",
        sex: "male",
        traits: { fat: true },
        age: 32,
        smart: true,
        money: 1_000,
        created: new Date(),
        from: "from",
      });
      assert(id).defined();
    });
  });

  test.case("get", async ({ assert, t }) => {
    await t(async ({ User }) => {
      const result = await User.insert({});
      assert(await User.get(result.id)).equals({ id: result.id });

      // empty get throws
      assert(() => User.get(300)).throws();

      const { id } = await User.insert({ ...traits });
      assert(await User.get(id)).equals({ id, ...traits });
    });
  });

  test.case("find", async ({ assert, t }) => {
    await t(async ({ User }) => {
      const user1 = { name: "Donald", sex: "M" };
      const user2 = { name: "Donald", sex: "M", age: 20 };
      const user3 = { name: "Ryan", sex: "M" };
      const { id: id1 } = await User.insert(user1);
      const { id: id2 } = await User.insert(user2);
      const { id: id3 } = await User.insert(user3);
      const user1$ = w(user1, id1);
      const user2$ = w(user2, id2);
      const user3$ = w(user3, id3);
      const users1 = await User.find({ name: "Donald" });
      // order not guaranteed
      assert(users1.find(({ id }) => `${id}` === `${user1$.id}`)).defined();
      assert(users1.find(({ id }) => `${id}` === `${user2$.id}`)).defined();
      assert(await User.find({ name: "Ryan" })).equals([user3$]);

      const users2 = await User.find({ sex: "M" });
      assert(users2.find(({ id }) => `${id}` === `${user1$.id}`)).defined();
      assert(users2.find(({ id }) => `${id}` === `${user2$.id}`)).defined();
      assert(users2.find(({ id }) => `${id}` === `${user3$.id}`)).defined();
      assert(await User.find({ sex: "F" })).equals([]);

      const users3 = await User.find();
      // order not guaranteed
      assert(users3.find(({ id }) => `${id}` === `${user1$.id}`)).defined();
      assert(users3.find(({ id }) => `${id}` === `${user2$.id}`)).defined();
      assert(users3.find(({ id }) => `${id}` === `${user3$.id}`)).defined();

      // multiple criteria
      const users4 = await User.find({ name: "Donald", age: 20 });
      assert(users4.length).equals(1);
      assert(users4.find(({ id }) => `${id}` === `${user2$.id}`)).defined();

      // embedded
      {
        const { id } = await User.insert({ ...traits });
        assert(await User.find({ id })).equals([{ id, ...traits }]);
      }
    });
  });

  test.case("find/projections", async ({ assert, t }) => {
    await t(async ({ User }) => {
      await User.insert({ name: "Donald", sex: "M", age: 20 });

      const criteria = { name: "Donald", age: 20 };
      // 0-field projection
      {
        // empty
        const [user] = await User.find(criteria);
        assert(user).equals({ ...criteria, sex: "M", id: user.id });
      }
      // 1-field projection
      {
        const [user] = await User.find(criteria, ["name"]);
        assert(user).equals({ name: "Donald" });
      }
      // n-field projection
      {
        const [user] = await User.find(criteria, ["name", "age"]);
        assert(user).equals(criteria);
      }
    });
  });

  test.case("find/sort", async ({ assert, t }) => {
    await t(async ({ User }) => {
      const donald = { name: "Donald", sex: "M", age: 21 };
      const ryan = { name: "Ryan", sex: "M", age: 20 };
      const p = ["name", "sex", "age"];

      await User.insert(donald);
      await User.insert(ryan);

      const criteria = { sex: "M" };
      // string asc
      {
        const [d, r] = await User.find(criteria, p, { sort: { name: "asc" } });
        assert(d).equals(donald);
        assert(r).equals(ryan);
      }
      // string desc
      {
        const [r, d] = await User.find(criteria, p, { sort: { name: "desc" } });
        assert(d).equals(donald);
        assert(r).equals(ryan);
      }
      // number asc
      {
        const [r, d] = await User.find(criteria, p, { sort: { age: "asc" } });
        assert(d).equals(donald);
        assert(r).equals(ryan);
      }
      // number desc
      {
        const [d, r] = await User.find(criteria, p, { sort: { age: "desc" } });
        assert(d).equals(donald);
        assert(r).equals(ryan);
      }
    });
  });

  test.case("count", async ({ assert, t }) => {
    await t(async ({ User }) => {
      const user1 = { name: "Donald", sex: "M" };
      const user2 = { name: "Donald", sex: "M", age: 20 };
      const user3 = { name: "Ryan", sex: "M" };
      await User.insert(user1);
      await User.insert(user2);
      await User.insert(user3);
      assert(await User.count({ name: "Donald" })).equals(2);
      assert(await User.count({ name: "Ryan" })).equals(1);
      assert(await User.count({ sex: "M" })).equals(3);
      assert(await User.count({ sex: "F" })).equals(0);
      assert(await User.count()).equals(3);
      assert(await User.count({ name: "Donald", age: 20 })).equals(1);
    });
  });

  test.case("update", async ({ assert, t }) => {
    await t(async ({ User }) => {

      const user1 = { name: "Donald" };
      const user2 = { name: "Donald" };
      const user3 = { name: "Donald", age: 34 };

      // base {{{
      {
        const { id: id1 } = await User.insert(user1);
        const { id: id2 } = await User.insert(user2);

        const updated = await User.update({ id: id1 }, { name: "Ryan" });
        assert(updated).equals(1);

        // doesn't delete
        assert(await User.count()).equals(2);
        // only modifies documents adhering to criteria
        assert(await User.get(id1)).equals({ id: id1, name: "Ryan" });
        assert(await User.get(id2)).equals(w(user2, id2));

        // empty collection
        await User.delete();
      }
      // }}}
      // replacing {{{
      {
        const { id: id1 } = await User.insert(user1);
        const { id: id2 } = await User.insert(user3);
        assert(await User.update({ id: id2 }, { name: "Ryan" })).equals(1);
        // only replaces given properties, leaves other intact
        assert(await User.get(id2)).equals({ id: id2, name: "Ryan", age: 34 });

        assert(await User.update({ id: id2 }, { name: "Donald" })).equals(1);
        // changes more than one
        assert(await User.update({ name: "Donald" }, { age: 20 })).equals(2);

        assert(await User.get(id1)).equals({ id: id1, name: "Donald", age: 20 });
        assert(await User.get(id2)).equals({ id: id2, name: "Donald", age: 20 });

        assert(await User.update({}, { name: "Ryan", age: 21 })).equals(2);
        assert(await User.get(id1)).equals({ id: id1, name: "Ryan", age: 21 });
        assert(await User.get(id2)).equals({ id: id2, name: "Ryan", age: 21 });

        assert(await User.update(undefined, { name: "Donald" })).equals(2);
        assert(await User.get(id1)).equals({ id: id1, name: "Donald", age: 21 });
        assert(await User.get(id2)).equals({ id: id2, name: "Donald", age: 21 });

        // empty collection
        await User.delete();
      }
      // }}}
      // null removal {{{
      {
        const { id } = await User.insert(user3);
        assert(await User.update({ id }, { name: null })).equals(1);

        // null removes
        assert(await User.get(id)).equals({ id, age: 34 });
      }
      // }}}
      // embedded {{{
      {
        const { id: id1 } = await User.insert(user1);
        assert(await User.update({ name: "Donald" }, { name: "Donald",
          ...traits })).equals(1);
        assert(await User.get(id1)).equals({ id: id1, name: "Donald", ...traits });
      }
      // }}}
    });
  });

  test.case("delete", async ({ assert, t }) => {
    await t(async ({ User }) => {
      const user1 = { name: "Donald" };
      const user2 = { name: "Donald" };
      const { id: id1 } = await User.insert(user1);
      const { id: id2 } = await User.insert(user2);
      const user2$ = w(user2, id2);

      // reduces count
      // only deletes specified entries
      assert(await User.delete({ id: id1 })).equals(1);
      assert(await User.count()).equals(1);
      assert(await User.get(id2)).equals(user2$);

      // no matching criteria is a noop
      assert(await User.delete({ id: id1 })).equals(0);
      assert(await User.count()).equals(1);

      // works with different criteria
      assert(await User.delete({ id: id2 })).equals(1);
      assert(await User.count()).equals(0);

      // no criteria removes everything
      await User.insert(user1);
      await User.insert(user1);
      assert(await User.count()).equals(2);
      assert(await User.delete()).equals(2);
      assert(await User.count()).equals(0);

      // removes more than one entry
      await User.insert(user1);
      await User.insert(user1);
      assert(await User.count()).equals(2);
      assert(await User.delete(user1)).equals(2);
      assert(await User.count()).equals(0);
    });
  });
  // test.case("transactions", async ({ assert, transaction, user }) => {
  // const {start, rollback, commit, end} = transaction;
  //
  // assert(() => rollback()).throws();
  // assert(() => commit()).throws();
  // await start();
  // const user1 = {name: "Donald"};
  // const user2 = {name: "Donald"};
  // await user.insert(user1);
  // // seeing changes
  // await assert(await user.count()).equals(1);
  // // changes discarded, transaction ended
  // await rollback();
  // // noop in some drivers, needed in others
  // await end();
  // await assert(await user.count()).equals(0);
  //
  // // new transaction
  // await start();
  // await user.insert(user2);
  // await commit();
  // // noop in some drivers, needed in others
  // await end();
  // assert(() => rollback()).throws();
  // // changes not discarded due to commit
  // await assert(await user.count()).equals(1);
  //
  // // new transaction
  // await start();
  // await user.insert(user2);
  // await rollback();
  // noop in some drivers, needed in others
  // await end();
  // // changes not discarded due to commit
  // await assert(await user.count()).equals(1);
  //
  // assert(() => rollback()).throws();
  // assert(() => commit()).throws();
  // });

  test.case("schema", async ({ assert, t }) => {
    await t(async ({ User }) => {
      const user1 = {
        name: "Donald",
        sex: "M",
        traits: { ...traits },
        age: 30,
        smart: true,
        money: 1_000_000n,
        created: new Date(),
      };

      const { id } = await User.insert(user1);
      assert(await User.get(id)).equals({ id, ...user1, traits: { ...traits } });
    });
  });

  test.case("reserved keywords", async ({ assert, t }) => {
    await t(async ({ User }) => {
      const user1 = {
        from: "test",
      };

      const { id } = await User.insert(user1);
      assert(await User.get(id)).equals({ id, ...user1 });

      await User.update({ id }, { from: "test2" });

      const updated = { id, from: "test2" };
      assert((await User.find(updated))[0]).equals(updated);

      await User.delete({ from: "test2" });
      assert(await User.count()).equals(0);
    });
  });
};
