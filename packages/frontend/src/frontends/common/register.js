import {tryreturn} from "runtime-compat/async";
import errors from "./errors.js";

const load = async path =>
  tryreturn(_ => import(`${path}.js`))
    .orelse(_ => errors.MissingComponent.throw(path.name, path));

export default ({app, rootname, ...rest}) => {
  const {config: {location}} = app;
  const filename = `${rootname}.js`;
  const base = app.runpath(location.server, location.components);
  return {
    root: app.runpath(location.server, filename),
    async make(name, props) {
      const component = await load(base.join(name));
      return {name, props, component: component.default ?? component};
    },
    ...rest,
  };
};
