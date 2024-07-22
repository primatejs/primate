import ComponentError from "@primate/frontend/errors/component-error";
import NoComponent from "@primate/frontend/errors/no-component";
import { tryreturn } from "rcompat/async";
import { File } from "rcompat/fs";

const MODULE_NOT_FOUND = "ERR_MODULE_NOT_FOUND";
const in_component = (code, error_path, component_path) =>
  code === MODULE_NOT_FOUND && File.same(error_path, component_path);

const no_component = (name, path) => {
  NoComponent.throw(name, path);
};
const component_error = (name, path, error) => {
  console.log(error);
  ComponentError.throw(name, path);
};
const get_error = (error, path) =>
  in_component(error.code, new File(error.url), new File(path))
    ? no_component
    : component_error
  ;

export default async path =>
  tryreturn(_ => File.import(`${path}.js`))
    .orelse(error => get_error(error, `${path}.js`)(path.name, path, error));
