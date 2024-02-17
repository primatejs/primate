import { is } from "rcompat/invariant";
import { tryreturn } from "rcompat/sync";
import o from "rcompat/object";
import { camelcased } from "rcompat/string";
import errors from "./errors.js";
import validate from "./validate.js";

export default (patches = {}) => (object, raw, cased = true) => {
  return Object.assign(Object.create(null), {
    ...o.map(patches, ([name, patch]) => [`get${camelcased(name)}`, key => {
      is(key).defined(`\`${name}\` called without key`);
      return tryreturn(_ => validate(patch, object[key], key))
        .orelse(({ message }) => errors.MismatchedType.throw(message));
    }]),
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
