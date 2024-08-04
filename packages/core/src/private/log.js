import loglevel from "#loglevel";
import mark from "#mark";
import blue from "@rcompat/cli/color/blue";
import dim from "@rcompat/cli/color/dim";
import green from "@rcompat/cli/color/green";
import red from "@rcompat/cli/color/red";
import yellow from "@rcompat/cli/color/yellow";
import print from "@rcompat/cli/print";

const url = "https://primatejs.com/errors";
const slice_length = "@primate/".length;
const helpat = (name, error) => `${url}/${name.slice(slice_length)}#${error}`;

const levels = {
  error: 0,
  warn: 1,
  info: 2,
};
const level = levels[loglevel];

const make_error = (level, { message, fix, name, params, module }) => ({
  level,
  fix: mark(fix, ...params),
  message: mark(message, ...params),
  name,
  module,
});

const normalize = (level, message) => typeof message === "string"
  ? { message }
  : make_error(level, message);

const log = (pre, color, error, override) => {
  const { fix, module, name, message } = { ...error, ...override };
  print(color(pre), `${module !== undefined ? `${color(module)} ` : ""}${message}`, "\n");
  if (fix) {
    print(blue("++"), fix);
    name && print(dim(`\n   -> ${helpat(module, name)}`), "\n");
  }
};

export default {
  system(message) {
    log("++", blue, { message });
  },

  info(error, override) {
    // info prints only on info level
    level === levels.info && log("--", green, normalize("info", error), override);
  },

  warn(error, override) {
    // warn prints on info and warn levels
    level >= levels.warn && log("??", yellow, normalize("warn", error), override);
  },

  error(error, override, toss = true) {
    // error always prints
    log("!!", red, normalize("error", error));
    if (toss) {
      error.level = "error";
      throw error;
    }
  },

  auto(error) {
    Object.keys(levels).includes(error.level) && this[error.level](error, {}, false);
  },
};
