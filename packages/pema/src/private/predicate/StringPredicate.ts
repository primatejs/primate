export default class StringPredicate {
  get type() {
    return "";
  }

  validate(s: string) {
    if (typeof s === "string") {
      return s;
    }
    throw new Error(`expected string, got \`${s}\` (${typeof s})`);
  }
};
