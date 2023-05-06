import {default as StringPredicate} from "./String.js";
import {default as NumberPredicate} from "./Number.js";
import {default as BooleanPredicate} from "./Boolean.js";
import {default as DatePredicate} from "./Date.js";
import {default as ArrayPredicate} from "./Array.js";
import {default as ObjectPredicate} from "./Object.js";
import {default as JSONPredicate} from "./JSON.js";

export default {
  [String]: StringPredicate,
  [Number]: NumberPredicate,
  [Boolean]: BooleanPredicate,
  [Date]: DatePredicate,
  [Array]: ArrayPredicate,
  [Object]: ObjectPredicate,
  [JSON]: {
    validate: value => {
      try {
        JSON.parse(value);
        return true;
      } catch (_) {
        return false;
      }
    },
    message: "Must be a valid JSON string",
    base: "json",
  },
};
