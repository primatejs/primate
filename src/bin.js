#!/usr/bin/env node
import config from "./config.js";
import run from "./run.js";
await run(await config());
