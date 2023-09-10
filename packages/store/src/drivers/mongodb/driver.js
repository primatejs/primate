import {filter} from "runtime-compat/object";
import {ident} from "../base.js";
import {peers} from "../common/exports.js";
import depend from "../../depend.js";
import wrap from "../../wrap.js";
import Facade from "./Facade.js";

const name = "mongodb";
const dependencies = ["mongodb"];
const on = filter(peers, ([key]) => dependencies.includes(key));
const defaults = {
  host: "localhost",
  port: 27017,
};

export default ({
  host = defaults.host,
  port = defaults.port,
  db,
} = {}) => async _ => {
  const [{
    MongoClient,
    ObjectId,
    Decimal128,
  }] = await depend(on, `store:${name}`);
  const url = `mongodb://${host}:${port}?replicaSet=rs0&directConnection=true`;
  const client = new MongoClient(url);
  await client.connect();

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
        const facade = new Facade(client.db(db), session);

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
