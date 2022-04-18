import {Test} from "debris";

const test = new Test();

test.case("correct value", (assert, {maybe, Animal, Person}) => {
  assert(maybe.array([])).true();
  assert(maybe.string("")).true();
  assert(maybe.defined(1)).true();
  assert(maybe.undefined()).true();
  assert(maybe.constructible(Animal)).true();
  assert(maybe.instance(new Animal(), Animal)).true();
  assert(maybe.subclass(Person, Animal)).true();
});

test.case("undefined", (assert, {maybe, Animal}) => {
  assert(maybe.array(undefined)).true();
  assert(maybe.string(undefined)).true();
  assert(maybe.defined(undefined)).true();
  // short-circuits
  assert(maybe.undefined(undefined)).true();
  assert(maybe.constructible(undefined)).true();
  assert(maybe.instance(undefined, Animal)).true();
  assert(maybe.subclass(undefined, Animal)).true();
});

test.case("null", (assert, {maybe, Animal}) => {
  assert(maybe.array(null)).true();
  assert(maybe.string(null)).true();
  assert(maybe.defined(null)).true();
  assert(maybe.undefined(null)).true();
  assert(maybe.constructible(null)).true();
  assert(maybe.instance(null, Animal)).true();
  assert(maybe.subclass(null, Animal)).true();
});

test.case("incorrect value defaults to is", (assert, {maybe, Animal}) => {
  assert(() => maybe.array("")).throws("must be array");
  assert(() => maybe.string([])).throws("must be string");
  // maybe.defined makes no sense, as maybe accepts undefined
  assert(maybe.defined(undefined)).true();
  assert(() => maybe.undefined("defined")).throws("must be undefined");
  assert(() => maybe.constructible({})).throws();
  assert(() => maybe.instance({}, Animal)).throws("must instance Animal");
  assert(() => maybe.subclass({}, Animal)).throws("must subclass Animal");
});

export default test;
