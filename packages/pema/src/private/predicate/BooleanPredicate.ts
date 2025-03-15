export default class BooleanPredicate {
  get type() {
    return false;
  }

  validate(b: boolean) {
    if (typeof b === "boolean") {
      return b;
    }
    throw new Error(`expected boolean, got \`${b}\` (${typeof b})`);
  }
};
