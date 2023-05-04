import {assert, is} from "runtime-compat/dyndef";
import {bold, green, red, yellow} from "runtime-compat/colors";

const error = 0;
const warn = 1;
const info = 2;

const Abort = class Abort extends Error {};
// Error natively provided
const Warn = class Warn extends Error {};
const Info = class Info extends Error {};

const levels = new Map([
  [Error, error],
  [Warn, warn],
  [Info, info],
]);

const abort = message => {
  throw new Abort(message);
};

const print = (...messages) => process.stdout.write(messages.join(" "));

const Logger = class Logger {
  #level; #trace;

  constructor({level = Error, trace = false} = {}) {
    assert(level !== undefined && levels.get(level) <= info);
    is(trace).boolean();
    this.#level = level;
    this.#trace = trace;
  }

  static print(...args) {
    print(...args);
  }

  static get Error() {
    return Error;
  }

  static get Warn() {
    return Warn;
  }

  static get Info() {
    return Info;
  }

  get class() {
    return this.constructor;
  }

  #print(pre, error) {
    if (error instanceof Error) {
      print(bold(pre), error.message, "\n");
      if (this.#trace) {
        console.log(error);
      }
    } else {
      print(bold(pre), error, "\n");
    }
  }

  get level() {
    return levels.get(this.#level);
  }

  info(message) {
    if (this.level >= levels.get(Info)) {
      this.#print(green("--"), message);
    }
  }

  warn(message) {
    if (this.level >= levels.get(Warn)) {
      this.#print(yellow("??"), message);
    }
  }

  error(message) {
    if (this.level >= levels.get(Error)) {
      this.#print(red("!!"), message);
    }
  }

  auto(message) {
    if (message instanceof Info) {
      return this.info(message.message);
    }
    if (message instanceof Warn) {
      return this.warn(message.message);
    }

    return this.error(message);
  }
};

export default Logger;

export {levels, print, abort, Abort};
