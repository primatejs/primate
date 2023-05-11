import {assert, is} from "runtime-compat/dyndef";
import {blue, bold, green, red, yellow, dim} from "runtime-compat/colors";

const errors = {
  Error: 0,
  Warn: 1,
  Info: 2,
};

const print = (...messages) => process.stdout.write(messages.join(" "));
const bye = () => print(dim(yellow("~~ bye\n")));
const mark = (format, ...params) => params.reduce((formatted, param) =>
  formatted.replace("%", bold(param)), format);

const reference = "https://primatejs.com/reference/errors";

const hyphenate = classCased => classCased
  .split("")
  .map(character => character
    .replace(/[A-Z]/u, capital => `-${capital.toLowerCase()}`))
  .join("")
  .slice(1);

const Logger = class Logger {
  #level; #trace;

  static throwable(type, name, module) {
    return {
      throw(args = {}) {
        const {message, level, fix} = type(args);
        const error = new Error(mark(...message));
        error.level = level;
        error.fix = mark(...fix);
        error.name = name;
        error.module = module;
        throw error;
      },
      warn(logger, ...args) {
        const {message, level, fix} = type(...args);
        const error = {level, message: mark(...message), fix: mark(...fix)};
        logger.auto({...error, name, module});
      },
    };
  }

  constructor({level = errors.Error, trace = false} = {}) {
    assert(level !== undefined && level <= errors.Info);
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
    return errors.Error;
  }

  static get Warn() {
    return errors.Warn;
  }

  static get Info() {
    return errors.Info;
  }

  get class() {
    return this.constructor;
  }

  #print(pre, color, message, {fix, module, name} = {}, error) {
    print(pre, `${module !== undefined ? `${color(module)} ` : ""}${message}`, "\n");
    if (fix && this.level >= errors.Warn) {
      print(blue("++"), fix);
      name && print(dim(`\n   -> ${reference}/${module ?? "primate"}#${hyphenate(name)}`), "\n");
    }
    if (this.#trace && error) {
      print(pre, color(module), "trace follows\n");
      console.log(error);
    }
  }

  get level() {
    return this.#level;
  }

  info(message, args) {
    if (this.level >= errors.Info) {
      this.#print(green("--"), green, message, args);
    }
  }

  warn(message, args) {
    if (this.level >= errors.Warn) {
      this.#print(yellow("??"), yellow, message, args);
    }
  }

  error(message, args, error) {
    if (this.level >= errors.Warn) {
      this.#print(red("!!"), red, message, args, error);
    }
  }

  auto(error) {
    const {level, message, ...args} = error;
    if (level === errors.Info) {
      return this.info(message, args, error);
    }
    if (level === errors.Warn) {
      return this.warn(message, args, error);
    }

    return this.error(message, args, error);
  }
};

export default Logger;

export {print, bye};
