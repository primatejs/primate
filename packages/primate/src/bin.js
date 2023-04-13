#!/usr/bin/env node
import args from "runtime-compat/args";
import run from "./run.js";

await run(args[0]);
