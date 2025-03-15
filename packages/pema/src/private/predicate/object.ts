import ObjectPredicate from "#predicate/ObjectPredicate";
import type Predicate from "#predicate/Predicate";
import type Dictionary from "@rcompat/record/Dictionary";

export default (o: Dictionary<Predicate>) => new ObjectPredicate(o);
