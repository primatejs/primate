import bigint from "#type/bigint";
import boolean from "#type/boolean";
import number from "#type/number";
import object from "#type/object";
import string from "#type/string";
import symbol from "#type/symbol";
import date from "#type/date";

const s = object({ foo: string });
const s_n = object({ foo: string, bar: number });
const s_n_b = object({ foo: string, bar: number, baz: boolean });

const f = { foo: "bar" };
const fb = { foo: "bar", bar: 0 };
const fbb = { foo: "bar", bar: 0, baz: false };

export default test => {
  test.case("empty", assert => {
    assert(object({}).validate({})).equals({});
  });

  test.case("flat", assert => {
    assert(s.validate(f)).equals(f);
    assert(s_n.validate(fb)).equals(fb);
    assert(s_n_b.validate(fbb)).equals(fbb);
  });

  test.case("deep", assert => {
    assert(() => s.validate({})).throws(".foo: expected string, got `undefined` (undefined)");
    assert(() => s_n.validate(f)).throws(".bar: expected number, got `undefined` (undefined)");

    // recursive
    const rc = object({ foo: object({ bar: string }) });
    assert(rc.validate({ foo: { bar: "baz" }})).equals({ foo: { bar: "baz" }});
    assert(() => rc.validate({ foo: { bar: 1 }})).throws();

    // recursive implicit
    const rci = object({ foo: { bar: string }});;
    assert(rci.validate({ foo: { bar: "baz" }})).equals({ foo: { bar: "baz" }});
    assert(() => rci.validate({ foo: { bar: 1 }})).throws();

    const x = {
      bigint: 0n,
      boolean: false,
      date: new Date(),
      number: 0,
      string: "",
      symbol: Symbol(),
      next: {
        bigint: 0n,
        boolean: false,
        date: new Date(),
        number: 0,
        string: "",
        next: {
          bigint: 0n,
          boolean: false,
          date: new Date(),
          number: 0,
          next: {
            bigint: 0n,
            boolean: false,
            date: new Date(),
            next: {
              bigint: 0n,
              boolean: false,
              next: {
                bigint: 0n,
              },
            },
          },
        },
      },
    };

    const full = object({ 
      bigint,
      boolean,
      date,
      number,
      string,
      symbol,
      next: {
        bigint,
        boolean,
        date,
        number,
        string,
        next: {
          bigint,
          boolean,
          date,
          number,
          next: {
            bigint,
            boolean,
            date,
            next: {
              bigint,
              boolean,
              next: {
                bigint,
              },
            },
          },
        },
      },
    });
    assert(full.validate(x)).equals(x);
  });
}
