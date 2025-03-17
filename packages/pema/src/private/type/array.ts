import type Infer from "#type/Infer";
import Validated from "#type/Validated";
import ValidatedKey from "#type/ValidatedKey";
import expected from "#type/expected";

export type ArrayMembers = (Validated<unknown> | ArrayMembers)[];

export type InferArray<T extends ArrayMembers> = {
    [K in keyof T]:
      T[K] extends Validated<unknown>
      ? Infer<T[K]>
      : T[K] extends ArrayMembers
        ? InferArray<T[K]>
        : never
};

function is_validated_type(x: unknown): x is Validated<unknown> {
  return !!x && typeof x === "object" && ValidatedKey in x;
}

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

class ArrayType<Members extends ArrayMembers>
  extends Validated<InferArray<Members>> {
  #members: Members;

  constructor(...members: Members) {
    super();
    this.#members = members;
  }

  validate(x: unknown, key?: string): Infer<this> {
    if (!(!!x && Array.isArray(x))) {
      throw new Error(error(expected("array", x), key));
    }

    this.#members.forEach((v, i) => {
      const validator = is_validated_type(v) ? v : new ArrayType(...v);
      validator.validate(x[i], `${member_error(i, key)}` as string);
    });

    return x as never;
  }
}

export default <const Members extends ArrayMembers>(...members: Members) =>
  new ArrayType(...members);
