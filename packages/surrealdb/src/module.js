import crypto from "runtime-compat/crypto";
import Surreal from "surrealdb.js";

export default async ({
  host = "http://127.0.0.1",
  port = 8000,
  path = "rpc",
  ns = "app",
  db = "app",
  user,
  pass,
} = {}) => {
  const client = new Surreal(`${host}:${port}/${path}`);
  if (user !== undefined && pass !== undefined) {
    await client.signin({user, pass});
  }
  await client.use(ns, db);
  let people = await client.select("person");
  return {
    name: "surrealdb",
    async primary() {
      return {
        generate: () => crypto.randomUUID(),
      };
    },
    start() {
      /* noop */
    },
    rollback() {
      /* noop */
    },
    commit() {
      /* noop */
    },
    end() {
      /* noop */
    },
    types: {
      primary: {
        validate(value) {
          return value;
        },
        in(value) {
          return value;
        },
        out(value) {
          return value; //.replace(/(?:.*):⟨(?<id>.*)⟩/u, (_, p1) => p1);
        },
      },
      datetime: {
        in(value) {
          return value;
        },
        out(value) {
          return new Date(value);
        },
      },
    },
    find(collection, criteria) {
      return client.select(criteria?.id ?? collection);
    },
    count(collection, criteria) {
    },
    get(collection, key, value) {
    },
    async insert(collection, document) {
      const [result] = await client.create(collection, document);
      return result;
    },
    update(collection, criteria, document) {
      return client.change(criteria?.id ?? collection, document);
    },
    delete(collection, criteria) {
      client.delete(criteria?.id ?? collection);
    },
  };
};
