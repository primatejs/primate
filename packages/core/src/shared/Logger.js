import { blue, bold, dim, green, red, yellow } from "rcompat/colors";
import { assert, is } from "rcompat/invariant";
import * as O from "rcompat/object";
import print from "./print.js";

const levels = {
  Error: 0,
  Warn: 1,
  Info: 2,
};

const bye = _ => print(dim(yellow("~~ bye\n")));
const mark = (format, ...params) => params.reduce((formatted, param, i) =>
  formatted.replace(`{${i}}`, bold(param)), format);

const reference = (module, error) => {
  const base = module === "primate" ? "guide/logging" : `modules/${module}`;
  return `https://primatejs.com/${base}#${hyphenate(error)}`;
};

const hyphenate = class_cased => class_cased
  .split("")
  .map(letter => letter.replace(/[A-Z]/u, upper => `-${upper.toLowerCase()}`))
  .join("")
  .slice(1);

const throwable = ({ message, level, fix }, name, module) => ({
  new(...args) {
    const error = new Error(mark(message, ...args));
    error.level = Logger[level];
    error.fix = mark(fix, ...args);
    error.name = name;
    error.module = module;
    return error;
  },
  throw(...args) {
    throw this.new(...args);
  },
  warn(logger, ...args) {
    const error = { level: Logger[level], message: mark(message, ...args),
      fix: mark(fix, ...args) };
    logger.auto({ ...error, name, module });
  },
});

export default class Logger {
  #level; #trace;

  static err(errors, module) {
    return O.map(errors, ([key, value]) => [key, throwable(value, key, module)]);
  }

  constructor({ level = levels.Error, trace = false } = {}) {
    assert(level !== undefined && level <= levels.Info);
    is(trace).boolean();
    this.#level = level;
    this.#trace = trace;
  }

  static get Error() {
    return levels.Error;
  }

  static get Warn() {
    return levels.Warn;
  }

  static get Info() {
    return levels.Info;
  }

  #print(pre, color, message, error = {}) {
    const { fix, module, name, level } = error;
    print(color(pre), `${module !== undefined ? `${color(module)} ` : ""}${message}`, "\n");
    if (fix) {
      print(blue("++"), fix);
      name && print(dim(`\n   -> ${reference(module, name)}`), "\n");
    }
    if (level === levels.Error || level === undefined && error.message) {
      this.#trace && console.log(error);
    }
  }

  get level() {
    return this.#level;
  }

  system(message) {
    print(`${blue("++")} ${message}\n`);
  }

  info(...args) {
    this.level >= levels.Info && this.#print("--", green, ...args);
  }

  warn(...args) {
    this.level >= levels.Warn && this.#print("??", yellow, ...args);
  }

  error(...args) {
    this.level >= levels.Warn && this.#print("!!", red, ...args);
  }

  auto(error) {
    const { message } = error;
    const matches = O.map(levels, ([key, level]) => [level, key.toLowerCase()]);
    return this[matches[error.level] ?? "error"](message, error);
  }
}

export { bye, mark, print };
