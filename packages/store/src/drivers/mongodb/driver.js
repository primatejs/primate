import {filter} from "runtime-compat/object";
import {ident} from "../base.js";

const toid = ({_id, ...rest}) => ({id: _id, ...rest});
const to_id = ({id, ...rest}) => id === undefined ? rest : {_id: id, ...rest};

const cid = criteria => criteria.id === undefined ? criteria : to_id(criteria);

const null_to_set_unset = delta => {
  const $set = filter(delta, ([, value]) => value !== null);
  const $unset = filter(delta, ([, value]) => value === null);
  return {$set, $unset};
};

export default ({
  host = "localhost",
  port = 27017,
  db,
} = {}) => async app => {
  const {MongoClient, ObjectId, Decimal128} = await app
    .depend("mongodb", "store:mongodb");
  const url = `mongodb://${host}:${port}`;
  const connection = new MongoClient(url);
  await connection.connect();
  const client = connection.db(db);

  return {
    name: "mongodb",
    client,
    async start() {
      // noop
    },
    async rollback() {
      // noop
    },
    async commit() {
      // noop
    },
    async end() {
      // noop
    },
    types: {
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
    },
    with(name) {
      return client.collection(name);
    },
    async find(collection, criteria = {}) {
      const result = await this.with(collection).find(cid(criteria)).toArray();
      return result.map(document => toid(document));
    },
    count(collection, criteria = {}) {
      return this.with(collection).count(criteria);
    },
    async get(collection, primary, value) {
      const result = await this.with(collection).findOne({_id: value});
      return result === null ? undefined : toid(result);
    },
    async insert(collection, primary, document) {
      await this.with(collection).insertOne(document);
      return toid(document);
    },
    async update(collection, criteria = {}, delta = {}) {
      return (await this.with(collection).updateMany(to_id(criteria),
        null_to_set_unset(delta))).modifiedCount;
    },
    async delete(collection, criteria = {}) {
      return (await this.with(collection).deleteMany(cid(criteria)))
        .deletedCount;
    },
  };
};
