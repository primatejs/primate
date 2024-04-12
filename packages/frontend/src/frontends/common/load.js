import { tryreturn } from "rcompat/async";
import FS from "rcompat/fs";
import errors from "./errors.js";

const MODULE_NOT_FOUND = "ERR_MODULE_NOT_FOUND";
const in_component = (code, error_path, component_path) =>
  code === MODULE_NOT_FOUND && FS.File.same(error_path, component_path);

const MissingComponent = (name, path) => {
  errors.MissingComponent.throw(name, path);
};
const ErrorInComponent = (name, path, error) => {
  console.log(error);
  errors.ErrorInComponent.throw(name, path);
};
const get_error = (error, path) =>
  in_component(error.code, new FS.File(error.url), new FS.File(path))
    ? MissingComponent
    : ErrorInComponent;

export default async path =>
  tryreturn(_ => FS.File.import(`${path}.js`))
    .orelse(error => get_error(error, `${path}.js`)(path.name, path, error));
