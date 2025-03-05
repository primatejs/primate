import component_error from "#error/component-error";
import no_component from "#error/no-component";
import tryreturn from "@rcompat/async/tryreturn";
import FileRef from "@rcompat/fs/FileRef";
import same from "@rcompat/fs/same";

const MODULE_NOT_FOUND = "ERR_MODULE_NOT_FOUND";
const in_component = (code, error_path, component_path) =>
  code === MODULE_NOT_FOUND && same(error_path, component_path);

const get_error = (name, path, error) =>
  (in_component(error.code, new FileRef(error.url), new FileRef(path))
    ? no_component
    : component_error)(name, path, error);

export default async path =>
  tryreturn(_ => new FileRef(`${path}.js`).import())
    .orelse(error => get_error(error, `${path}.js`)(path.name, path, error));
