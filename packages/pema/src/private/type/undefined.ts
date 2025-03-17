import ValidatedPrimitive from "#type/ValidatedPrimitive";

class UndefinedType extends ValidatedPrimitive<undefined> {
  constructor() {
    super("undefined");
  }
}

export default new UndefinedType();
