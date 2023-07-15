import {assert, is} from "runtime-compat/dyndef";
import {blue, bold, green, red, yellow, dim} from "runtime-compat/colors";
import {map} from "runtime-compat/object";
import console from "runtime-compat/console";

const levels = {
  Error: 0,
  Warn: 1,
  Info: 2,
};

const print = (...messages) => process.stdout.write(messages.join(" "));
const bye = _ => print(dim(yellow("~~ bye\n")));
const mark = (format, ...params) => params.reduce((formatted, param, i) =>
  formatted.replace(`{${i}}`, bold(param)), format);

const reference = "https://primatejs.com/reference/errors";

const hyphenate = classCased => classCased
  .split("")
  .map(letter => letter.replace(/[A-Z]/u, upper => `-${upper.toLowerCase()}`))
  .join("")
  .slice(1);

const throwable = ({message, level, fix}, name, module) => ({
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
    const error = {level: Logger[level], message: mark(message, ...args),
      fix: mark(fix, ...args)};
    logger.auto({...error, name, module});
  },
});

const Logger = class Logger {
  #level; #trace;

  static err(errors, module) {
    return map(errors, ([key, value]) => [key, throwable(value, key, module)]);
  }

  constructor({level = levels.Error, trace = false} = {}) {
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
    const {fix, module, name, level} = error;
    print(color(pre), `${module !== undefined ? `${color(module)} ` : ""}${message}`, "\n");
    if (fix) {
      print(blue("++"), fix);
      name && print(dim(`\n   -> ${reference}/${module ?? "primate"}#${hyphenate(name)}`), "\n");
    }
    if (level === levels.Error || level === undefined && error.message) {
      this.#trace && console.log(error);
    }
  }

  get level() {
    return this.#level;
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
    const {message} = error;
    const matches = map(levels, ([name, level]) => [level, name.toLowerCase()]);
    return this[matches[error.level] ?? "error"](message, error);
  }
};

export default Logger;

export {print, bye, mark};
