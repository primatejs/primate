import {is, invariant} from "./invariants.js";

const map_entries = (object = {}, mapper = (...args) => args) =>
  invariant(() => is.object(object) && is.function(mapper))
  && Object.fromEntries(Object.entries(object).map(([key, value]) =>
    mapper(key, value)));

export default map_entries;
