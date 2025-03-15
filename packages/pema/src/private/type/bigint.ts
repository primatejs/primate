import ValidatedPrimitive from "#type/ValidatedPrimitive";

class BigIntType extends ValidatedPrimitive<bigint> {
  constructor() {
    super("bigint");
  }
}

export default new BigIntType();
