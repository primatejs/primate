import is_validated_type from "#type/is_validated_type";
import t_null from "#type/null";
import object from "#type/object";
import tuple from "#type/tuple";
import notdefined from "#type/undefined";
import type Validated from "#type/Validated";

export type Schema =
  Validated<unknown> |
  (Validated<unknown>)[] |
  null |
  undefined |
  { [k: string]: Validated<unknown> };

export default (value: Schema): Validated<unknown> => {
  if (value === undefined) {
    return notdefined;
  }

  if (value === null) {
    return t_null;
  }

  if (is_validated_type(value))  {
    return value;
  }

  if (Array.isArray(value)) {
    return tuple(value);
  }

  if (typeof value === "object") {
    return object(value);
  }

  console.log(value);

  throw new Error("wrong schema");
}
