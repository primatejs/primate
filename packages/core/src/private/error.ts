import type { PrimateError } from "#log";
import log, { type LogLevel } from "@primate/core/log";
import FileRef from "@rcompat/fs/FileRef";

const base = (level: LogLevel) => (url: string, args: Omit<PrimateError, 'level'>) => (...params: string[]) => log[level]({
  params,
  name: new FileRef(url).base,
  module: "@primate/core",
  ...args,
  level,
});

const info = base("info");
const warn = base("warn");
const error = base("error");

export { error, info, warn };
