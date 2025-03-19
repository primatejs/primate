import type Infer from "#type/Infer";
import Validated from "#type/Validated";
import expected from "#type/expected";

const member_error = (i: unknown, key?: string) => {
  return key === undefined
    ? `[${i}]`
    : `${key}[${i}]`;
}

const error = (message: string, key?: string) => {
  return key === undefined
    ? message
    : `${key}: ${message}`;
}

const is = <T>(x: unknown, validator: (t: unknown) => boolean): x is T => validator(x);

class ArrayType<Subtype extends Validated<unknown>>
  extends Validated<Infer<Subtype>[]> {
  #subtype: Subtype;

  constructor(subtype: Subtype) {
    super();
    this.#subtype = subtype;
  }

  get name() {
    return "array";
  }

  validate(x: unknown, key?: string): Infer<this> {
    if (!is<Subtype[]>(x, _ => !!x && Array.isArray(x))) {
      throw new Error(error(expected("array", x), key));
    }

    let last = 0;
    x.forEach((v, i) => {
      // sparse array check
      if (i > last) {
        throw new Error(error(expected(this.#subtype.name, undefined), `[${last}]`));
      }
      const validator = this.#subtype;
      validator.validate(v, `${member_error(i, key)}` as string);
      last++;
    });

    // sparse array with end slots
    if (x.length > last) {
        throw new Error(error(expected(this.#subtype.name, undefined), `[${last}]`));
    }

    return x as never;
  }
}

export default <const Subtype extends Validated<unknown>>(subtype: Subtype) =>
  new ArrayType(subtype);
