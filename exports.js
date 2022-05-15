import conf from "./source/conf.js";
import App from "./source/App.js";

export {App};
export {default as Bundler} from "./source/Bundler.js";
export {default as EagerPromise, eager} from "./source/EagerPromise.js" ;

export {default as Domain} from "./source/domain/Domain.js";
export {default as Storeable} from "./source/types/Storeable.js";

export * from "./source/errors.js";
export * from "./source/invariants.js";

export {default as MemoryStore} from "./source/store/Memory.js";
export {default as Store} from "./source/store/Store.js";

export {default as extend_object} from "./source/extend_object.js";

export {default as html} from "./source/handlers/html.js";
export {default as json} from "./source/handlers/json.js";
export {default as redirect} from "./source/handlers/redirect.js";
export {http404} from "./source/handlers/http.js";

export {default as DOMParser} from "./source/handlers/DOM/Parser.js";

export {default as router} from "./source/Router.js";

const app = new App(conf());

export {app};
