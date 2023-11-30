import { is } from "rcompat/invariant";
import { tryreturn } from "rcompat/sync";
import { map } from "rcompat/object";
import { camelcased } from "rcompat/string";
import errors from "./errors.js";
import validate from "./validate.js";

export default (patches = {}) => (object, raw, cased = true) => {
  return Object.assign(Object.create(null), {
    ...map(patches, ([name, patch]) => [`get${camelcased(name)}`, property => {
      is(property).defined(`\`${name}\` called without property`);
      return tryreturn(_ => validate(patch, object[property], property))
        .orelse(({ message }) => errors.MismatchedType.throw(message));
    }]),
    get(property) {
      is(property).string();

      return object[cased ? property : property.toLowerCase()];
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
