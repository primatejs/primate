import ValidatedPrimitive from "#type/ValidatedPrimitive";

class NumberType extends ValidatedPrimitive<number> {
  constructor() {
    super("number");
  }
}

export default new NumberType();
