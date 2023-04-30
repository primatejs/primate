import {assert, is} from "runtime-compat/dyndef";

const colors = {
  black: msg => `\x1b[0m${msg}\x1b[0m`,
  bold: msg => `\x1b[1m${msg}\x1b[0m`,
  red: msg => `\x1b[31m${msg}\x1b[0m`,
  green: msg => `\x1b[32m${msg}\x1b[0m`,
  yellow: msg => `\x1b[33m${msg}\x1b[0m`,
  blue: msg => `\x1b[34m${msg}\x1b[0m`,
  gray: msg => `\x1b[2m${msg}\x1b[0m`,
};

const error = 0;
const warn = 1;
const info = 2;

const Exit = class Exit extends Error {};
// Error natively provided
const Warn = class Warn extends Error {};
const Info = class Info extends Error {};

const levels = new Map([
  [Error, error],
  [Warn, warn],
  [Info, info],
]);

const print = (...messages) => process.stdout.write(messages.join(" "));

const Logger = class Logger {
  #level; #trace;

  constructor({level = Error, trace = false} = {}) {
    assert(level !== undefined && levels.get(level) <= info);
    is(trace).boolean();
    this.#level = level;
    this.#trace = trace;
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

  #print(pre, error) {
    if (error instanceof Error) {
      print(colors.bold(pre), error.message, "\n");
      if (this.#trace) {
        console.log(error);
      }
    } else {
      print(colors.bold(pre), error, "\n");
    }
  }

  get level() {
    return levels.get(this.#level);
  }

  info(message) {
    if (this.level >= levels.get(Info)) {
      this.#print(colors.green("--"), message);
    }
  }

  warn(message) {
    if (this.level >= levels.get(Warn)) {
      this.#print(colors.yellow("??"), message);
    }
  }

  error(message) {
    if (this.level >= levels.get(Error)) {
      this.#print(colors.red("!!"), message);
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

export {colors, levels, print, Exit};
