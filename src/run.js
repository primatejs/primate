import env from "./env.js";
import command from "./commands/exports.js";

export default async name => command(name)(await env());
