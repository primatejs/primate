import {is, invariant} from "./invariants.js";

export default (object = {}, mapper = (...args) => args) =>
  invariant(() => is.object(object) && is.function(mapper))
  && Object.fromEntries(Object.entries(object).map(([key, value]) =>
    mapper(key, value)));
