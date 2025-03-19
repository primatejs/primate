import type Infer from "#type/Infer";
import Validated from "#type/Validated";
import expected from "#type/expected";
import is_validated_type from "#type/is_validated_type";
import notdefined from "#type/undefined";
import schema, { type Schema } from "#type/schema";

type TupleMembers = Validated<unknown>[];

export type InferTuple<T extends TupleMembers> = {
    [K in keyof T]:
      T[K] extends Validated<unknown>
      ? Infer<T[K]>
      : T[K] extends TupleMembers
        ? InferTuple<T[K]>
        : never
};

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

class TupleType<Members extends TupleMembers>
  extends Validated<InferTuple<Members>> {
  #members: Members;

  constructor(members: Members) {
    super();
    this.#members = members;
  }

  get name() {
    return "tuple";
  }

  validate(x: unknown, key?: string): Infer<this> {
    if (!(!!x && Array.isArray(x))) {
      throw new Error(error(expected("array", x), key));
    }

    this.#members.forEach((v, i) => {
      const validator = is_validated_type(v) ? v : schema(v);
      validator.validate(x[i], `${member_error(i, key)}` as string);
    });

    (x as unknown[]).forEach((v, i) => {
      const member = this.#members[i];
      const validator = is_validated_type(member) ? member : schema(member);
      validator.validate(v, `${member_error(i, key)}` as string);
    });

    return x as never;
  }
}

export default <const Members extends TupleMembers>(members: Members) =>
  new TupleType(members);
