import ident from "@primate/store/base/ident";
import wrap from "@primate/store/base/wrap";
import { name } from "@primate/store/sqlite/common";
import numeric from "@rcompat/invariant/numeric";
import Facade from "./Facade.js";
import { connect } from "./driver.js";

export default options => async () => {
  const client = await connect(options);

  const types = {
    primary: {
      validate(value) {
        if (typeof value === "number" || numeric(value)) {
          return Number(value);
        }
        throw new Error(`\`${value}\` is not a valid primary key value`);
      },
      ...ident,
      out(value) {
        // bigint
        return Number(value);
      },
    },
    object: {
      in(value) {
        return JSON.stringify(value);
      },
      out(value) {
        return JSON.parse(value);
      },
    },
    number: {
      in(value) {
        return value;
      },
      out(value) {
        return Number(value);
      },
    },
    // in: driver accepts both number and bigint
    // out: find/get currently set statement.safeIntegers(true);
    bigint: ident,
    boolean: {
      in(value) {
        return value === true ? 1 : 0;
      },
      out(value) {
        // out: find/get currently set statement.safeIntegers(true);
        return Number(value) === 1;
      },
    },
    date: {
      in(value) {
        return value.toJSON();
      },
      out(value) {
        return new Date(value);
      },
    },
    string: ident,
  };

  return {
    name,
    types,
    async transact(stores) {
      return async (others, next) => {
        const connection = await client.acquire();
        const facade = new Facade(connection);
        try {
          connection.prepare("begin transaction").run();
          const response = await next([...others, ...stores.map(([_, store]) =>
            [_, wrap(store, facade, types)]),
          ]);
          connection.prepare("commit transaction").run();
          return response;
        } catch (error) {
          connection.prepare("rollback transaction").run();
          // bubble up
          throw error;
        } finally {
          // noop, no end transaction
          client.release(connection);
        }
      };
    },
  };
};
