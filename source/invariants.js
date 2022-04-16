import {constructible, nullish} from "./attributes.js";

const errored = error => {
  if (typeof error === "function") {
    // fallback
    error();
  } else {
    // error
    throw new Error(error);
  }
};

const assert = (predicate, error) => Boolean(predicate) || errored(error);
const is = {
  "array": value => assert(Array.isArray(value), "must be array"),
  "string": value => assert(typeof value === "string", "must be string"),
  "defined": (value, error) => assert(value !== undefined, error),
  "undefined": value => assert(value === undefined, "must be undefined"),
  "constructible": (value, error) => assert(constructible(value), error),
  "instance": (object, Class) => assert(object instanceof Class,
    `must instance ${Class.name}`),
  "subclass": (object, Class) => assert(object?.prototype instanceof Class,
    `must subclass ${Class.name}`),
};
const {defined} = is;

const maybe = Object.keys(is).reduce((aggregator, property) => {
  aggregator[property] = value => nullish(value) || is[property](value);
  return aggregator;
}, {});

export {assert, defined, is, maybe};
