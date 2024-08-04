import log from "@primate/core/log";
import file from "@rcompat/fs/file";

const base = level => (url, args) => (...params) => log[level]({
  params,
  name: file(url).base,
  module: "@primate/core",
  ...args,
});

const info = base("info");
const warn = base("warn");
const error = base("error");

export { error, info, warn };
