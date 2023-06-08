import {keymap} from "runtime-compat/object";
import {tryreturn} from "runtime-compat/flow";
import errors from "../errors.js";

// insensitive-case equal
const ieq = (left, right) => left.toLowerCase() === right.toLowerCase();

/* routes may not contain dots */
export const invalid = route => /\./u.test(route);

export default app => {
  const {types, routes, config: {explicit}, modules, dispatch} = app;

  const isType = (groups, path) => Object
    .entries(groups ?? {})
    .map(([name, value]) =>
      [types[name] === undefined || explicit ? name : `${name}$${name}`, value])
    .filter(([name]) => name.includes("$"))
    .map(([name, value]) => [name.split("$")[1], value])
    .every(([name, value]) =>
      tryreturn(_ => types?.[name](value) === true)
        .orelse(({message}) => errors.MismatchedPath.throw(path, message)));
  const isPath = ({route, path}) => {
    const result = route.path.exec(path);
    return result === null ? false : isType(result.groups, path);
  };
  const isMethod = ({route, method, path}) => ieq(route.method, method)
    && isPath({route, path});
  const find = (method, path) => routes.find(route =>
    isMethod({route, method, path}));

  return request => {
    const {original: {method}, url: {pathname}} = request;
    const verb = find(method, pathname) ??
      errors.NoRouteToPath.throw(
        method,
        pathname,
        `${app.config.paths.routes}${pathname === "" ? "index" : pathname}.js`
      );

    // verb.handler is the last module to be executed
    const handlers = [...modules.route, verb.handler]
      .reduceRight((acc, handler) => input => handler(input, acc));

    return handlers({...request,
      path: dispatch(keymap(verb.path?.exec(pathname).groups,
        key => key.split("$")[0])),
    });
  };
};
