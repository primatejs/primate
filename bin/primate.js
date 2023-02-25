#!/usr/bin/env node

import conf from "../src/conf.js";
import run from "../src/run.js";
await run(await conf());
