import Predicate from "./Predicate.js";
import * as types from "../types/types.js";

export default test => {
  test.case("check: no parameters", assert => {
    const predicate = new Predicate("length");
    assert(() => predicate.check())
      .throws("`undefined` must be of type string");
  });

  test.case("check: property must be string", (assert, {mowgli}) => {
    const predicate = new Predicate("tell_name_to");
    assert(() => predicate.check({}))
      .throws("`[object Object]` must be of type string");
    assert(() => predicate.check("name", mowgli)).not_throws();
  });

  test.case("check: `document` must instance Domain", assert => {
    const predicate = new Predicate("tell_name_to");
    assert(() => predicate.check("name"))
      .throws("`undefined` must instance Domain");
  });

  test.case("check: native predicates must have type", (assert, {mowgli}) => {
    const predicate = new Predicate("length:6");
    assert(() => predicate.check("name", mowgli))
      .throws("`undefined` must subclass Storable");
    assert(() => predicate.check("name", mowgli, types.StringType)).not_throws();
  });

  test.case("constructor: no definition", assert => {
    assert(() => new Predicate()).throws("`undefined` must be of type string");
  });

  test.case("constructor: definition with no params", assert => {
    const predicate = new Predicate("length");
    assert(predicate.name).equals("length");
    assert(predicate.params).equals([]);
  });

  test.case("constructor: definition with params", assert => {
    const predicate = new Predicate("length:6");
    assert(predicate.name).equals("length");
    assert(predicate.params).equals(["6"]);
  });
};
