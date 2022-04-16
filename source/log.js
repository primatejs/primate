const colors = {
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
};
const reset = 0;

const Log = {
  "paint": (color, message) => {
    process.stdout.write(`\x1b[${color}m${message}\x1b[0m`);
    return log;
  },
  "nl": () => log.paint(reset, "\n"),
};

const log = new Proxy(Log, {
  "get": (target, property) => target[property] ?? (message =>
    log.paint(colors[property] ?? reset, message).paint(reset, " ")),
});

export default log;
