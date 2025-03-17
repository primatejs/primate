import type Infer from "#type/Infer";
import Validated from "#type/Validated";

const error_message = (name: string, x: unknown, key?: string) => {
  const base = `expected ${name}, got \`${x}\` (${(typeof x)})`;
  return key === undefined
    ? base
    : `${key}: ${base}`;
}

export default class ValidatedInstance<StaticType> extends Validated<StaticType> {
  #name: string;
  #instance: Function;

  constructor(name: string, instance: Function) {
    super();
    this.#name = name;
    this.#instance = instance;
  }

  validate(x: unknown, key: string): Infer<this> {
    if (!(x instanceof this.#instance)) {
      throw new Error(error_message(this.#name, x, key));
    }

    return x as never;
  }
}
