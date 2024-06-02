#!/usr/bin/env node
import args from "rcompat/args";
import init from "./init.js";
const [command, ...params] = args;
await init(command, params);
