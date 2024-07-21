import ErrorInComponent from "@primate/frontend/errors/error-in-component";
import MissingComponent from "@primate/frontend/errors/missing-component";
import { tryreturn } from "rcompat/async";
import { File } from "rcompat/fs";

const MODULE_NOT_FOUND = "ERR_MODULE_NOT_FOUND";
const in_component = (code, error_path, component_path) =>
  code === MODULE_NOT_FOUND && File.same(error_path, component_path);

const missing_component = (name, path) => {
  MissingComponent.throw(name, path);
};
const error_in_component = (name, path, error) => {
  console.log(error);
  ErrorInComponent.throw(name, path);
};
const get_error = (error, path) =>
  in_component(error.code, new File(error.url), new File(path))
    ? missing_component
    : error_in_component
  ;

export default async path =>
  tryreturn(_ => File.import(`${path}.js`))
    .orelse(error => get_error(error, `${path}.js`)(path.name, path, error));
