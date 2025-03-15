import type BooleanPredicate from "#predicate/BooleanPredicate";
import type NumberPredicate from "#predicate/NumberPredicate";
import type ObjectPredicate from "#predicate/ObjectPredicate";
import type StringPredicate from "#predicate/StringPredicate";

type Predicate =
  | BooleanPredicate
  | NumberPredicate
  | StringPredicate
  | ObjectPredicate;

export { Predicate as default };
