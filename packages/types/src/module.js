import {extend} from "runtime-compat/object";
import * as types from "./types.js";

export default _ => {
  return {
    name: "@primate/types",
    init(app, next) {
      return next({...app, types: extend(app.types, {...types})});
    },
  };
};
