import {extend} from "runtime-compat/object";
import * as types from "./types.js";

export default ({} = {}) => {
  const env = {
    defaults: {},
  };
  return {
    name: "@primate/types",
    async init(app) {
      env.log = app.log;
      app.types = extend(app.types, {...types});
    },
  };
};
