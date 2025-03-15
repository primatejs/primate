import boolean from "#predicate/boolean";
import number from "#predicate/number";
import string from "#predicate/string";
import object from "#predicate/object";

export default test => {
  test.case("boolean", assert => {
    assert((boolean().validate(true))).equals(true);
    assert((boolean().validate(false))).equals(false);
    assert(() => (boolean().validate("true"))).throws("expected boolean, got `true` (string)");
  });

  test.case("number", assert => {
    assert((number().validate(1))).equals(1);
    assert(() => (number().validate("1"))).throws("expected number, got `1` (string)");
  })

  test.case("string", assert => {
    assert((string().validate("test"))).equals("test");
    assert(() => (string().validate(1))).throws("expected string, got `1` (number)");
  });

  test.case("object", assert => {
//    assert(object({}).validate({})).equals({});
    assert(() => object({ foo: string() }).validate({})).throws(".foo: expected string, got `undefined` (undefined)");
  });
}
