import type Infer from "#type/Infer";
import Validated from "#type/Validated";
import ValidatedKey from "#type/ValidatedKey";

type ArrayMembers = Validated<unknown>[];

type InferArray<T extends ArrayMembers> = {
    [K in keyof T]: Infer<T[K]>
};

function is_validated_type(x: unknown): x is Validated<unknown> {
  return !!x && typeof x === "object" && ValidatedKey in x;
}

class ArrayType<Members extends ArrayMembers>
  extends Validated<InferArray<Members>> {
  #members: Members;

  constructor(members: Members) {
    super();
    this.#members = members;
  }

  validate(x: unknown): Infer<this> {
    if (!(!!x && Array.isArray(x))) {
      throw new Error("NOT AN ARRAY");
    }

    this.#members.forEach((v, i) => {
      const validator = is_validated_type(v) ? v : new ArrayType(v);
      validator.validate(x[i], `[${i}]` as string);
    });

    return x as never;
  }
}

export default <Members extends ArrayMembers>(members: Members) =>
  new ArrayType(members);
