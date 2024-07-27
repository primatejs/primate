import ident from "@primate/store/base/ident";
import wrap from "@primate/store/base/wrap";
import { name } from "@primate/store/mongodb/common";
import Facade from "./Facade.js";
import { connect, Decimal128, ObjectId } from "./driver.js";

export default ({ host, port, database } = {}) => async _ => {
  const client = await connect({ host, port });

  const types = {
    primary: {
      validate(value) {
        /* TODO: check that has valid objectid form */
        if (typeof value === "string") {
          return value;
        }
        throw new Error(`\`${value}\` is not a valid primary key value`);
      },
      in(value) {
        return new ObjectId(value);
      },
      out(value) {
        return value.toString();
      },
    },
    object: ident,
    number: ident,
    bigint: {
      in(value) {
        return new Decimal128(value.toString());
      },
      out(value) {
        return BigInt(value.toString());
      },
    },
    boolean: ident,
    date: ident,
    string: ident,
  };

  return {
    name,
    types,
    async transact(stores) {
      return async (others, next) => {
        const session = client.startSession();
        const facade = new Facade(client.db(database), session);

        try {
          return await session.withTransaction(async () => {
            const response = await next([...others, ...stores.map(([_, store]) =>
              [_, wrap(store, facade, types)]),
            ]);
            return response;
          });
        } finally {
          session.endSession();
        }
      };
    },
  };
};
