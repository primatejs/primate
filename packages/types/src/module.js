import * as types from "./types/exports.js";

const extend = (base = {}, extension = {}) =>
  Object.keys(extension).reduce((result, property) => {
    const value = extension[property];
    result[property] = value?.constructor === Object
      ? extend(base[property], value)
      : value;
    return result;
  }, base);

export default ({} = {}) => {
  const env = {
    defaults: {},
  };
  return {
    name: "@primate/types",
    async load(app) {
      env.log = app.log;
      app.types = extend(app.types, types);
    },
  };
};
