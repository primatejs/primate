import Facade from "#Facade";
import connect from "#connect";
import ident from "@primate/store/core/ident";
import wrap from "@primate/store/core/wrap";
import numeric from "@rcompat/invariant/numeric";

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
    },
    object: {
      in(value) {
        return JSON.stringify(value);
      },
      out(value) {
        return JSON.parse(value);
      },
    },
    number: ident,
    bigint: {
      in(value) {
        return value.toString();
      },
      out(value) {
        return BigInt(value);
      },
    },
    boolean: {
      in(value) {
        return value === true ? 1 : 0;
      },
      out(value) {
        return Number(value) === 1;
      },
    },
    date: {
      in(value) {
        return value;
      },
      out(value) {
        return new Date(value);
      },
    },
    string: ident,
  };

  return {
    name: "@primate/mysql",
    types,
    async transact(stores) {
      return async (others, next) => {
        const connection = await client.getConnection();
        const facade = new Facade(connection);
        try {
          await connection.query("start transaction");
          const response = await next([...others, ...stores.map(([_, store]) =>
            [_, wrap(store, facade, types)]),
          ]);
          await connection.query("commit");
          return response;
        } catch (error) {
          await connection.query("rollback");
          // bubble up
          throw error;
        } finally {
          // noop, no end transaction
          client.releaseConnection(connection);
        }
      };
    },
  };
};
