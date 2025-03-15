import type Predicate from "#predicate/Predicate";
import type Dictionary from "@rcompat/record/Dictionary";

function validate<T>(x: Predicate<T>, t: T): T {
  const keys = Object.keys(x);

  if (keys.length === 0) {
    return {} as T;
  }

  const result: Dictionary = {};

  for (const key of keys) {
    const subpredicate = x[key as keyof T];
    try {
      result[key] = subpredicate.validate(t[key as keyof T]);
    } catch (error) {
       throw new Error(`.${key}: ${(error as any).message}`);
    }
  }

  return result as T;
}

export default class ObjectPredicate<T> {
  #o: Predicate<T>;

  constructor(o: Predicate<T>) {
    this.#o = o;
  }

  get type() {
    const _ = this.#o;
    return {} as typeof _;
  }

  validate(o: T) {
    return validate(this.#o, o);
  }
};
