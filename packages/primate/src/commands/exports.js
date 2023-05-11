import {default as dev} from "./dev.js";
import {default as serve} from "./serve.js";

const commands = {dev, serve};

const run = name => commands[name] ?? dev;

export default name => name === undefined ? dev : run(name);
