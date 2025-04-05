import { default as build } from "./build.js";
import { default as dev } from "./dev.js";
import { default as serve } from "./serve.js";
import { default as test } from "./test.js"

export default (name: string) => ({ build, dev, serve, test })[name] ?? dev;
