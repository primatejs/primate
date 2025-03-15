import ValidatedPrimitive from "#type/ValidatedPrimitive";

class SymbolType extends ValidatedPrimitive<symbol> {
  constructor() {
    super("symbol");
  }
}

export default new SymbolType();
