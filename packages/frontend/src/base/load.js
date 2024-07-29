import ComponentError from "@primate/frontend/errors/component-error";
import NoComponent from "@primate/frontend/errors/no-component";
import tryreturn from "@rcompat/async/tryreturn";
import same from "@rcompat/fs/same";
import file from "@rcompat/fs/file";

const MODULE_NOT_FOUND = "ERR_MODULE_NOT_FOUND";
const in_component = (code, error_path, component_path) =>
  code === MODULE_NOT_FOUND && same(error_path, component_path);

const no_component = (name, path) => {
  NoComponent.throw(name, path);
};
const component_error = (name, path, error) => {
  console.log(error);
  ComponentError.throw(name, path);
};
const get_error = (error, path) =>
  in_component(error.code, file(error.url), file(path))
    ? no_component
    : component_error
  ;

export default async path =>
  tryreturn(_ => file(`${path}.js`).import())
    .orelse(error => get_error(error, `${path}.js`)(path.name, path, error));
