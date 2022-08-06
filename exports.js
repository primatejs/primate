import {File, Path} from "runtime-compat/filesystem";

import _conf from "./source/conf.js";
const conf = _conf();
import App from "./source/App.js";

export {App};
export {default as Bundler} from "./source/Bundler.js";

export {default as Domain} from "./source/domain/Domain.js";
export {default as Storeable} from "./source/types/Storeable.js";

export * from "./source/errors.js";

export {default as MemoryStore} from "./source/store/Memory.js";
export {default as Store} from "./source/store/Store.js";

export {default as extend_object} from "./source/extend_object.js";

import _html from "./source/handlers/html.js";
const {paths: {components: path}} = conf;
const loadFile = async file => [new Path(file.path).base, await file.read()];
const components = await path.file.exists
  ? Object.fromEntries(await Promise.all((
    await File.collect(path, ".html")).map(loadFile)))
  : {};
export const html = _html(components);

export {default as json} from "./source/handlers/json.js";
export {default as redirect} from "./source/handlers/redirect.js";
export {http404} from "./source/handlers/http.js";

export {default as DOMParser} from "./source/handlers/DOM/Parser.js";

export {default as router} from "./source/Router.js";

const app = new App(conf);

export {app};
