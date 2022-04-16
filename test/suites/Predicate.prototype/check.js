import {Test} from "debris";

const test = new Test();

test.case("no parameters", (assert, {Predicate}) => {
  const predicate = new Predicate("length");
  assert(() => predicate.check()).throws("must be string");
});

test.case("property must be string", (assert, {Predicate, mowgli}) => {
  const predicate = new Predicate("tell_name_to");
  assert(() => predicate.check({})).throws("must be string");
  assert(() => predicate.check("name", mowgli)).not_throws();
});

test.case("`document` must instance Domain", (assert, {Predicate}) => {
  const predicate = new Predicate("tell_name_to");
  assert(() => predicate.check("name")).throws("must instance Domain");
});

test.case("native predicates must have type", (assert, fixtures) => {
  const {Predicate, types, mowgli} = fixtures;
  const predicate = new Predicate("length:6");
  assert(() => predicate.check("name", mowgli))
    .throws("must subclass Storeable");
  assert(() => predicate.check("name", mowgli, types.StringType)).not_throws();
});

export default test;
