import expected from "#type/expected";
import type Infer from "#type/Infer";
import ValidatedPrimitive from "#type/ValidatedPrimitive";

const error_message = (name: string, x: unknown, key?: string) => {
  const base = expected(name, x);
  return key === undefined
    ? base
    : `${key}: ${base}`;
};

class NullType extends ValidatedPrimitive<undefined> {
  constructor() {
    super("null");
  }
  
  validate(x: unknown, key?: string): Infer<this> {
    if (x !== null) {
      throw new Error(error_message(this.name, x, key));
    }

    return x as never;
  }
}

export default new NullType();
