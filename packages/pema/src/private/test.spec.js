import boolean from "#predicate/boolean";
import number from "#predicate/number";
import string from "#predicate/string";
import object from "#predicate/object";
import ObjectPredicate from "#predicate/ObjectPredicate";

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
    assert(object({}).validate({})).equals({});

    const s = object({ foo: string() });
    const s_n = object({ foo: string(), bar: number() });
    const s_n_b = object({ foo: string(), bar: number(), baz: boolean() });

    const f = { foo: "bar" };
    const fb = { foo: "bar", bar: 0 };
    const fbb = { foo: "bar", bar: 0, baz: false };

    assert(s.validate(f)).equals(f);
    assert(s_n.validate(fb)).equals(fb);
    assert(s_n_b.validate(fbb)).equals(fbb);

    assert(() => s.validate({})).throws(".foo: expected string, got `undefined` (undefined)");
    assert(() => s_n.validate(f)).throws(".bar: expected number, got `undefined` (undefined)");

    // recursive
    const rc = object({ foo: object({ bar: string() }) });
    assert(rc.validate({ foo: { bar: "baz" }})).equals({ foo: { bar: "baz" }});
    assert(() => rc.validate({ foo: { bar: 1 }})).throws();

    // recursive implicit
    /*const rci = object({ foo: { bar: string() }});;
    assert(rci.validate({ foo: { bar: "baz" }})).equals({ foo: { bar: "baz" }});
    assert(() => rci.validate({ foo: { bar: 1 }})).throws();*/
  });
}
