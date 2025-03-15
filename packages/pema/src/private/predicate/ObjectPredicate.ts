import type Predicate from "#predicate/Predicate";

function validate<T>(x: Predicate<T>, t: T): T {
  const keys = Object.keys(x);

  if (keys.length === 0) {
    return {} as T;
  }

  const result: T = {} as T;

  for (const key of keys) {
    const subpredicate = x[key as keyof T];
    try {
      // @ts-expect-error test
      result[key as keyof T] = subpredicate.validate(t[key as keyof T])
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
    return {};
  }

  validate(o: T) {
    return validate(this.#o, o);
  }
};
