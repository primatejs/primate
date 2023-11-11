import crypto from "rcompat/crypto";
import { is } from "rcompat/invariant";

export default (store, id) => {
  let $id = id;

  const exists = () => {
    return store.has($id);
  };

  const getAll = _ => {
    return store.get($id) ?? {};
  };

  const set = (key, value) => {
    if (exists()) {
      store.set($id, { ...getAll(), [key]: value });
    } else {
      throw new Error("cannot call set on an uninitialized session");
    }
  };

  return {
    get id() {
      return $id;
    },
    exists,
    get(key) {
      is(key).string();

      return store.get($id)?.[key];
    },
    set,
    getAll,
    create(data = {}) {
      if (!exists()) {
        $id = crypto.randomUUID();
        store.set($id, { ...getAll(), ...data });
      }
    },
    destroy() {
      if (exists()) {
        store.delete($id);
      }
    },
  };
};

