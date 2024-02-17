import o from "rcompat/object";
import { unwrap, unwrap_async } from "./unwrap.js";

const dispatchers = ["path", "query", "headers", "cookies"];

const wrap_dispatchers = (toPy, request) => o.from(dispatchers.map(dispatcher =>
  [dispatcher, {
    ...request[dispatcher],
    json() {
      return toPy(request[dispatcher].json());
    },
  }]));

const wrap_store = (toPy, store) => {
  return {
    ...store,
    async validate(input) {
      return toPy(await store.validate(unwrap_async(input)));
    },
    async get(value) {
      return toPy(await store.get(unwrap_async(value)));
    },
    async count(criteria) {
      return store.count(unwrap_async(criteria));
    },
    async find(criteria) {
      return toPy(await store.find(unwrap_async(criteria)));
    },
    async exists(criteria) {
      return store.exists(unwrap_async(criteria));
    },
    async insert(document) {
      return toPy(await store.insert(unwrap_async(document)));
    },
    async update(criteria, document) {
      const ua = unwrap_async;
      return toPy(await store.update(ua(criteria), ua(document)));
    },
    async save(document) {
      return toPy(await store.save(unwrap_async(document)));
    },
    async delete(criteria) {
      return store.delete(unwrap_async(criteria));
    },
    schema: {
      async create(description) {
        return store.schema.create(unwrap_async(description));
      },
      async delete() {
        return store.schema.delete();
      },
    },
  };
};

const is_store = value => value.connection !== undefined;
const wrap_stores = (toPy, object) => o.to(object)
  .reduce((reduced, [key, value]) => ({
    ...reduced,
    [key]: is_store(value) ? wrap_store(toPy, value) : wrap_stores(toPy, value),
  }), {});

const wrap_session = (toPy, { session }) => ({
  ...session,
  create(data) {
    session.create(unwrap(data));
  },
  json() {
    return toPy(session.json());
  },
});

export default (toPy, request) => ({
  ...request,
  ...wrap_dispatchers(toPy, request),
  session: wrap_session(toPy, request),
  store: wrap_stores(toPy, request.store),
});
