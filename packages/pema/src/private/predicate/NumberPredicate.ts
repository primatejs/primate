export default class NumberPredicate {
  get type() {
    return 0;
  }

  validate(n: number) {
    if (typeof n === "number") {
      return n;
    }
    throw new Error(`expected number, got \`${n}\` (${typeof n})`);
  }
};
