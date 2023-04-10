#!/usr/bin/env node
import args from "runtime-compat/args";
import * as commands from "./commands/exports.js";
import run from "./run.js";

const command = name => commands[name] ?? commands.help;

await run(args[0] === undefined ? commands.dev : command(args[0]));
