import Facade from "#Facade";
import connect from "#connect";
import ident from "@primate/store/core/ident";
import wrap from "@primate/store/core/wrap";
import { Decimal128, ObjectId } from "mongodb";

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
    name: "@primate/mongodb",
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
