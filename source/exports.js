import conf from "./conf.js";
import App from "./App.js";

export {App};
export {default as Bundler} from "./Bundler.js";
export {default as Directory} from "./Directory.js";
export {default as File} from "./File.js";
export {default as EagerPromise, eager} from "./EagerPromise.js" ;

export {default as Domain} from "./domain/Domain.js";
export {default as Storeable} from "./types/Storeable.js";

export * from "./errors.js";
export * from "./invariants.js";

export {default as MemoryStore} from "./store/Memory.js";
export {default as Store} from "./store/Store.js";

export {default as log} from "./log.js";
export {default as extend_object} from "./extend_object.js";
export {default as sanitize} from "./sanitize.js";

export {default as html} from "./handlers/html.js";
export {default as json} from "./handlers/json.js";
export {default as redirect} from "./handlers/redirect.js";

export {default as router} from "./Router.js";

const app = new App(conf());

export {app};
