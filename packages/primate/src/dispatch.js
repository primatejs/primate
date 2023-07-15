import {is, maybe} from "runtime-compat/dyndef";
import {tryreturn} from "runtime-compat/sync";
import {map} from "runtime-compat/object";
import {camelcased} from "runtime-compat/string";
import errors from "./errors.js";

export default (patches = {}) => (value, raw) => {
  return Object.assign(Object.create(null), {
    ...map(patches, ([name, patch]) => [`get${camelcased(name)}`, property => {
      is(property).defined(`\`${name}\` called without property`);
      return tryreturn(_ => patch(value[property], property))
        .orelse(({message}) => errors.MismatchedType.throw(message));
    }]),
    get(property) {
      maybe(property).string();
      return property === undefined ? value : value[property];
    },
    raw,
  });
};
