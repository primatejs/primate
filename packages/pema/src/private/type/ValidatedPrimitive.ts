import type Infer from "#type/Infer";
import Validated from "#type/Validated";
import expected from "#type/expected";

const error_message = (name: string, x: unknown, key?: string) => {
  const base = expected(name, x);
  return key === undefined
    ? base
    : `${key}: ${base}`;
};

export default class ValidatedPrimitive<StaticType> extends Validated<StaticType> {
  #name: string;

  constructor(name: string) {
    super();
    this.#name = name;
  }

  validate(x: unknown, key: string): Infer<this> {
    if (typeof x !== this.#name) {
      throw new Error(error_message(this.#name, x, key));
    }

    return x as never;
  }
}
