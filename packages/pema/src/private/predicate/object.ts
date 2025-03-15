import ObjectPredicate from "#predicate/ObjectPredicate";
import type Predicate from "#predicate/Predicate";

export default <T>(o: Predicate<T>) => new ObjectPredicate(o);
