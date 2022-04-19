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
  "object": value => assert(typeof value === "object" && value !== null,
    "must be object"),
  "function": value => assert(typeof value === "function", "must be function"),
  "defined": (value, error) => assert(value !== undefined, error),
  "undefined": value => assert(value === undefined, "must be undefined"),
  "constructible": (value, error) => assert(constructible(value), error),
  "instance": (object, Class) => assert(object instanceof Class,
    `must instance ${Class.name}`),
  "subclass": (object, Class) => assert(object?.prototype instanceof Class,
    `must subclass ${Class.name}`),
};
const {defined} = is;

// too early to use map_entries here, as it relies on invariants
const maybe = Object.fromEntries(Object.entries(is).map(([key, value]) =>
  [key, (...args) => nullish(args[0]) || value(...args)]));

const invariant = predicate => predicate();

export {assert, defined, is, maybe, invariant};
