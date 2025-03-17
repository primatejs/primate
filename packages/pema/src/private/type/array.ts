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

class ArrayType<Subtype extends Validated<unknown>>
  extends Validated<Infer<Subtype>[]> {
  #subtype: Subtype;

  constructor(subtype: Subtype) {
    super();
    this.#subtype = subtype;
  }

  validate(x: unknown, key?: string): Infer<this> {
    if (!(!!x && Array.isArray(x))) {
      throw new Error(error(expected("array", x), key));
    }

    (x as Subtype[]).forEach((v, i) => {
      const validator = this.#subtype;
      validator.validate(v, `${member_error(i, key)}` as string);
    });

    return x as never;
  }
}

export default <const Subtype extends Validated<unknown>>(subtype: Subtype) =>
  new ArrayType(subtype);
