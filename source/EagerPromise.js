import {inconstructible_function} from "./attributes.js";

const $promise = Symbol("#promise");

const handler = {
  "get": (target, property) => {
    const promise = target[$promise];

    if (["then", "catch"].includes(property)) {
      return promise[property].bind(promise);
    }

    return EagerPromise.resolve(promise.then(result => property === "bind"
      ? result
      : inconstructible_function(result[property])
        ? result[property].bind(result)
        : result[property]
    ));
  },
  "apply": (target, that, args) =>
    EagerPromise.resolve(target[$promise].then(result =>
      typeof result === "function" ? result.apply(that, args) : result
    )),
};

export default class EagerPromise {
  constructor(resolve, reject) {
    const promise = new Promise(resolve, reject);
    const callable = () => undefined;
    callable[$promise] = promise;
    return new Proxy(callable, handler);
  }

  static resolve(value) {
    return new EagerPromise(resolve => resolve(value));
  }

  static reject(value) {
    return new EagerPromise((resolve, reject) => reject(value));
  }
}

const last = -1;
const eager = async (strings, ...keys) =>
  (await Promise.all(strings.slice(0, last).map(async (string, i) =>
    strings[i] + await keys[i]
  ))).join("") + strings.at(last);

export {eager};
