import o from "rcompat/object";
import * as types from "./types.js";

export default _ => {
  return {
    name: "primate:types",
    init(app, next) {
      return next({ ...app, types: o.extend(app.types, { ...types }) });
    },
  };
};
