import loglevel from "#loglevel";
import mark from "#mark";
import blue from "@rcompat/cli/color/blue";
import dim from "@rcompat/cli/color/dim";
import green from "@rcompat/cli/color/green";
import red from "@rcompat/cli/color/red";
import yellow from "@rcompat/cli/color/yellow";
import print from "@rcompat/cli/print";

const reference = (module, error) => {
  const base = module === "primate" ? "guide/logging" : `modules/${module}`;
  return `https://primatejs.com/${base}#${error}`;
};
const levels = {
  error: 0,
  warn: 1,
  info: 2,
};
const level = levels[loglevel];

const make_error = (level, { message, fix, name, params, module }) => {
  const error = new Error(mark(message, ...params));
  error.level = level;
  error.fix = mark(fix, ...params);
  error.name = name;
  error.module = module;
  return error;
};

const normalize = (level, message) => typeof message === "string"
  ? { message }
  : make_error(level, message);

const log = (pre, color, error) => {
  const { fix, module, name, message } = error;
  print(color(pre), `${module !== undefined ? `${color(module)} ` : ""}${message}`, "\n");
  if (fix) {
    print(blue("++"), fix);
    name && print(dim(`\n   -> ${reference(module, name)}`), "\n");
  }
};

export default {
  system(message) {
    log("++", blue, { message });
  },

  info(error) {
    // info prints only on info level
    level === levels.info && log("--", green, normalize("info", error));
  },

  warn(error) {
    // warn prints on info and warn levels
    level >= levels.warn && log("??", yellow, normalize("warn", error));
  },

  error(error, toss = true) {
    // error always prints
    log("!!", red, normalize("error", error));
    if (toss) {
      error.level = "error";
      throw error;
    }
  },

  auto(error) {
    Object.keys(levels).includes(error.level) && this[error.level](error, false);
  },
};
