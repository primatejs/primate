import {Test} from "debris";

const test = new Test();

test.case("property required", (assert, {Field}) => {
  assert(() => new Field()).throws("`property` required");
});

test.case("type must be constructible", (assert, {Field}) => {
  assert(() => new Field("name", {"type": String})).not_throws();
  assert(() => new Field("name", {})).throws();
  for (const type of [{}, [], undefined, null, "", 0]) {
    assert(() => new Field("name", {type})).throws();
  }
});

test.case("type must be Storeable", (assert, {Field, Animal, Storeable}) => {
  // no error, builtin
  assert(() => new Field("name", String)).not_throws();
  // no error, Domain
  assert(() => new Field("name", Animal)).not_throws();
  // no error, extends Storeable
  const StoreableAnimal = class extends Storeable {};
  assert(() => new Field("name", StoreableAnimal)).not_throws();
  // error, does not extend Storeable
  assert(() => new Field("name", Field)).throws("must subclass Storeable");
});

test.case("predicates must be array", (assert, {Field}) => {
  const field = predicates => new Field("name", {"type": String, predicates});

  assert(() => field([])).not_throws();
  // guarded by maybe.array accepting undefined or null
  assert(() => field(undefined)).not_throws();
  assert(() => field(null)).not_throws();

  for (const predicates of [{}, "", 0]) {
    assert(() => field(predicates)).throws("must be array");
  }
});

test.case("options.{transient,optional} default to false", (assert, {Field}) => {
  const name = new Field("name", String);
  assert(name.options.transient).false();
  assert(name.options.optional).false();
});

export default test;
