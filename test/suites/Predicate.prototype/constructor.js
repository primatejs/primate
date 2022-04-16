import {Test} from "debris";

const test = new Test();

test.case("no definition", (assert, {Predicate}) => {
  assert(() => new Predicate()).throws("must be string");
});

test.case("definition with no params", (assert, {Predicate}) => {
  const predicate = new Predicate("length");
  assert(predicate.name).equals("length");
  assert(predicate.params).equals([]);
});

test.case("definition with params", (assert, {Predicate}) => {
  const predicate = new Predicate("length:6");
  assert(predicate.name).equals("length");
  assert(predicate.params).equals(["6"]);
});

export default test;
