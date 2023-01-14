import {PredicateError} from "../errors.js";

export default class Storable {
  static verify_undefined(optional) {
    if (!optional) {
      throw new PredicateError("Must not be empty");
    }
  }

  static async verify_defined(property, document, type) {
    if (!await this.is(document[property], type.Type)) {
      throw new PredicateError(this.type_error(type.Type));
    }
    await Promise.all(type.predicates.map(predicate =>
      predicate.check(property, document, this)));
  }

  static verify(property, document, type) {
    document[property] = this.coerce(document[property]);
    return document[property] === undefined
      ? this.verify_undefined(type.options.optional)
      : this.verify_defined(property, document, type);
  }

  static type_error() {
    return this.errors.type;
  }

  static is() {
    throw new Error("Must be implemented");
  }

  static async has(name, value, params) {
    if (!this[name](value, ...params)) {
      let error = this.errors[name];
      for (let i = 0; i < params.length; i++) {
        error = error.replace(`$${i + 1}`, () => params[i]);
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
