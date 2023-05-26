import {assert, is} from "runtime-compat/dyndef";
import {blue, bold, green, red, yellow, dim} from "runtime-compat/colors";

const levels = {
  Error: 0,
  Warn: 1,
  Info: 2,
};

const print = (...messages) => process.stdout.write(messages.join(" "));
const bye = () => print(dim(yellow("~~ bye\n")));
const mark = (format, ...params) => params.reduce((formatted, param, i) =>
  formatted.replace(`{${i}}`, bold(param)), format);

const reference = "https://primatejs.com/reference/errors";

const hyphenate = classCased => classCased
  .split("")
  .map(character => character
    .replace(/[A-Z]/u, capital => `-${capital.toLowerCase()}`))
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
    return Object.fromEntries(Object.entries(errors)
      .map(([name, error]) => [name, throwable(error, name, module)]));
  }


  constructor({level = levels.Error, trace = false} = {}) {
    assert(level !== undefined && level <= levels.Info);
    is(trace).boolean();
    this.#level = level;
    this.#trace = trace;
  }

  static print(...args) {
    print(...args);
  }

  static get mark() {
    return mark;
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

  get class() {
    return this.constructor;
  }

  #print(pre, color, message, {fix, module, name} = {}, error) {
    print(pre, `${module !== undefined ? `${color(module)} ` : ""}${message}`, "\n");
    if (fix && this.level >= levels.Warn) {
      print(blue("++"), fix);
      name && print(dim(`\n   -> ${reference}/${module ?? "primate"}#${hyphenate(name)}`), "\n");
    }
    this.#trace && error && console.log(error);
  }

  get level() {
    return this.#level;
  }

  info(message, args) {
    if (this.level >= levels.Info) {
      this.#print(green("--"), green, message, args);
    }
  }

  warn(message, args) {
    if (this.level >= levels.Warn) {
      this.#print(yellow("??"), yellow, message, args);
    }
  }

  error(message, args, error) {
    if (this.level >= levels.Warn) {
      this.#print(red("!!"), red, message, args, error);
    }
  }

  auto(error) {
    const {level, message, ...args} = error;
    if (level === levels.Info) {
      return this.info(message, args, error);
    }
    if (level === levels.Warn) {
      return this.warn(message, args, error);
    }

    return this.error(message, args, error);
  }
};

export default Logger;

export {print, bye};
