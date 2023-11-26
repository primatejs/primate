import { to } from "rcompat/object";
import { unwrap, unwrap_async } from "./unwrap.js";

const wrap_store = store => {
  return {
    ...store,
    async validate(input) {
      return store.validate(unwrap_async(input));
    },
    async get(value) {
      return store.get(unwrap_async(value));
    },
    async count(criteria) {
      return store.count(unwrap_async(criteria));
    },
    async find(criteria) {
      return store.find(unwrap_async(criteria));
    },
    async exists(criteria) {
      return store.exists(unwrap_async(criteria));
    },
    async insert(document) {
      return store.insert(unwrap_async(document));
    },
    async update(criteria, document) {
      return store.update(unwrap_async(criteria), unwrap_async(document));
    },
    async save(document) {
      return store.save(unwrap_async(document));
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

const wrap_stores = object => {
  return to(object).reduce((reduced, [key, value]) => {
    if (value.connection !== undefined) {
      return { ...reduced, [key]: wrap_store(value) };
    }
    return { ...reduced, [key]: wrap_stores(value) };
  }, {});
};

export default request => {
  return {
    ...request,
    session: {
      ...request.session,
      create(data) {
        request.session.create(unwrap(data));
      },
    },
    store: wrap_stores(request.store),
  };
};
