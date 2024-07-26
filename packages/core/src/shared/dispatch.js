import { is } from "rcompat/invariant";

export default (object, raw, cased = true) => {
  return Object.assign(Object.create(null), {
    get(key) {
      is(key).string();

      return object[cased ? key : key.toLowerCase()];
    },
    json() {
      return JSON.parse(JSON.stringify(object));
    },
    toString() {
      return JSON.stringify(object);
    },
    raw,
  });
};
