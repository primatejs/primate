import BooleanPredicate from "#predicate/BooleanPredicate";
import NumberPredicate from "#predicate/NumberPredicate";
import type Predicate from "#predicate/Predicate";
import StringPredicate from "#predicate/StringPredicate";
import type Dictionary from "@rcompat/record/Dictionary";

export default class ObjectPredicate {
  #o: Dictionary<Predicate>;

  constructor(o: Dictionary<Predicate>) {
    this.#o = o;
  }

  get type() {
    return {};
  }

  validate(o: Dictionary): Dictionary {
    const keys = Object.keys(this.#o);

    if (keys.length === 0) {
      return {};
    }

    for (const key of keys) {
      const subpredicate = this.#o[key];

      if (subpredicate instanceof BooleanPredicate) {
        try {
          subpredicate.validate(o[key] as BooleanPredicate["type"]);
        } catch (error) {
          throw new Error(`.${key}: ${(error as any).message}`);
        }
      }

      if (subpredicate instanceof NumberPredicate) {
        try {
          subpredicate.validate(o[key] as NumberPredicate["type"]);
        } catch (error) {
          throw new Error(`.${key}: ${(error as any).message}`);
        }
      }

      if (subpredicate instanceof StringPredicate) {
        try {
          subpredicate.validate(o[key] as StringPredicate["type"]);
        } catch (error) {
          throw new Error(`.${key}: ${(error as any).message}`);
        }
      }
    }

    throw new Error("");
  }
};
