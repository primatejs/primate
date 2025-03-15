import ValidatedPrimitive from "#type/ValidatedPrimitive";

class StringType extends ValidatedPrimitive<string> {
  constructor() {
    super("string");
  }
}

export default new StringType();
