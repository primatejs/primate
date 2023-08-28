#!/usr/bin/env node
import args from "runtime-compat/args";
import * as commands from "./commands/exports.js";
commands[args[0]]?.() ?? commands.create();
