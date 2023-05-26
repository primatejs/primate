import {is, maybe} from "runtime-compat/dyndef";
import errors from "./errors.js";

export default (patches = {}) => value => {
  is(patches.get).undefined();
  return Object.assign(Object.create(null), {
    ...Object.fromEntries(Object.entries(patches).map(([name, patch]) =>
      [name, property => {
        is(property).defined(`\`${name}\` called without property`);
        try {
          return patch(value[property], property);
        } catch ({message}) {
          errors.MismatchedType.throw(message);
        }
      }])),
    get(property) {
      maybe(property).string();
      if (property !== undefined) {
        return value[property];
      }
      return value;
    },
  });
};
