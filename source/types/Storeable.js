import {PredicateError} from "../errors.js";

export default class Storeable {
  static async verify(property, document, predicates, type) {
    document[property] = this.coerce(document[property]);
    if (!await this.is(document[property], type)) {
      throw new PredicateError(this.type_error(type));
    }
    await Promise.all(predicates.map(predicate =>
      predicate.check(property, document, this)));
  }

  static type_error() {
    return this.errors.type;
  }

  static is() {
    throw new Error("must be implemented");
  }

  static async has(name, value, params) {
    if (!this[name](value, ...params)) {
      let error = this.errors[name];
      for (let i = 0; i < params.length; i++) {
        error = error.replace(`$${i+1}`, () => params[i]);
      }
      throw new PredicateError(error);
    }
  }

  static coerce(value) {
    return value;
  }

  // noop for builtin types
  static serialize(value) {
    return value;
  }

  // noop for builtin types
  static deserialize(value) {
    return value;
  }
}
