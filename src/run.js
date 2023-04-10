import config from "./config.js";
import command from "./commands/exports.js";

export default async name => command(name)(await config());
