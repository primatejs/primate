import ident from "#ident";

// we can't depend on @primate/schema here
const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;
const test = value => typeof value === "string" && valid.test(value);

export default {
  primary: {
    validate(value) {
      if (test(value)) {
        return value;
      }
      throw new Error(`\`${value}\` is not a valid primary key value`);
    },
    ...ident,
  },
  object: ident,
  boolean: ident,
  number: ident,
  bigint: {
    in(value) {
      return value.toString();
    },
    out(value) {
      return BigInt(value);
    },
  },
  date: ident,
  string: ident,
};
