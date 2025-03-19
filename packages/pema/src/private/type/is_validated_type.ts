import type Validated from "#type/Validated";
import ValidatedKey from "#type/ValidatedKey";

export default (x: unknown): x is Validated<unknown> => {
  return !!x && typeof x === "object" && ValidatedKey in x;
};
