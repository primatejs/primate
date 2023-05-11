import {default as ArrayPredicate} from "./Array.js";
import {default as BigIntPredicate} from "./BigInt.js";
import {default as BooleanPredicate} from "./Boolean.js";
import {default as DatePredicate} from "./Date.js";
import {default as JSONPredicate} from "./JSON.js";
import {default as NumberPredicate} from "./Number.js";
import {default as ObjectPredicate} from "./Object.js";
import {default as StringPredicate} from "./String.js";

export default {
  [Array]: ArrayPredicate,
  [BigInt]: BigIntPredicate,
  [Boolean]: BooleanPredicate,
  [Date]: DatePredicate,
  [JSON]: JSONPredicate,
  [Number]: NumberPredicate,
  [Object]: ObjectPredicate,
  [String]: StringPredicate,
};
