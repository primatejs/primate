#!/usr/bin/env node

import _conf from "../src/conf.js";
const conf = _conf();
import App from "../src/App.js";
const app = new App(conf);

await app.run();
