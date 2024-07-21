import { maybe } from "rcompat/invariant";

export default ({ sort = {} } = {}) => {
  maybe(sort).object();

  const entries = Object.entries(sort)
    .map(([field, direction]) => `${field} ${direction}`);

  return entries.length === 0 ? "" : `order by ${entries.join(",")}`;
};
