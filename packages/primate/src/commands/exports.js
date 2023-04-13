import {default as dev} from "./dev.js";
import {default as serve} from "./serve.js";
import {default as create} from "./create.js";
import {default as help} from "./help.js";

const commands = {dev, serve, create, help};

const run = name => commands[name] ?? help;

export default name => name === undefined ? dev : run(name);
