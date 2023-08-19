import {tryreturn} from "runtime-compat/async";
import errors from "./errors.js";

const load = async path =>
  tryreturn(async () => (await import(`${path}.js`)).default)
    .orelse(_ => errors.MissingComponent.throw(path.name, path));

export default ({app, rootname}) => {
  const filename = `${rootname}.js`;
  const base = app.runpath(location.server, location.components);
  return {
    root: app.runpath(location.server, filename),
    async make(name, props) {
      return {name, props, component: await load(base.join(name))};
    },
  };
};
