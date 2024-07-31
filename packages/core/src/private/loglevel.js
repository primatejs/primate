import args from "@rcompat/args";

const default_level = "warn";
const flag = "--loglevel=";
const levels = ["error", "warn", "info"];

const loglevel = args.find(arg => arg.startsWith(flag))?.slice(flag.length);

export default levels.includes(loglevel) ? loglevel : default_level;
