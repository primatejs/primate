import {tryreturn} from "runtime-compat/async";
import errors from "./errors.js";

export default async path =>
  tryreturn(_ => import(`${path}.js`))
    .orelse(_ => errors.MissingComponent.throw(path.name, path));
