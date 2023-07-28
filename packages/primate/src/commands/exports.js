import {default as dev} from "./dev.js";
import {default as serve} from "./serve.js";

export default name => ({dev, serve})[name] ?? dev;
