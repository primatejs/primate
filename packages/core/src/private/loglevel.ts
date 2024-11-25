import args from "@rcompat/args";

export const levels = {
  error: 0,
  warn: 1,
  info: 2,
} as const;

export type LogLevel = keyof typeof levels;

const default_level: LogLevel = "warn";
const flag = "--loglevel=";
const loglevel = args.find(arg=> arg.startsWith(flag))?.slice(flag.length) as LogLevel;

export default loglevel in levels ? loglevel : default_level;
