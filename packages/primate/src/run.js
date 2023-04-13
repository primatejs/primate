import app from "./app.js";
import command from "./commands/exports.js";

export default async name => command(name)(await app());
