import {is} from "./invariants.js";
import map_entries from "./map_entries.js";

export default (dirty = {}) => is.object(dirty)
  && map_entries(dirty, (key, value) => {
    const trimmed = value.toString().trim();
    return [key, trimmed === "" ? undefined : trimmed];
  });
