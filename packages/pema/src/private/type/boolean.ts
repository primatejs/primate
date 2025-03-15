import ValidatedPrimitive from "#type/ValidatedPrimitive";

class BooleanType extends ValidatedPrimitive<boolean> {
  constructor() {
    super("boolean");
  }
}

export default new BooleanType();
