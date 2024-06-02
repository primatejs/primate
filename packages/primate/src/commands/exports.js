import { default as dev } from "./dev.js";
import { default as build } from "./build.js";
import { default as serve } from "./serve.js";

export default name => ({ dev, build, serve })[name] ?? dev;
