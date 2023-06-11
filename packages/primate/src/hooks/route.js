import {keymap} from "runtime-compat/object";
import {tryreturn} from "runtime-compat/flow";
import errors from "../errors.js";
import {respond} from "./respond/exports.js";

// insensitive-case equal
const ieq = (left, right) => left.toLowerCase() === right.toLowerCase();

/* routes may not contain dots */
export const invalid = route => /\./u.test(route);

export default app => {
  const {types, routes, config: {explicit, paths}, modules, dispatch} = app;

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
  const guardError = Symbol("guardError");
  const index = path => path === "" ? "index" : path;

  return async request => {
    const {original: {method}, url: {pathname}} = request;
    const path = pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1) : pathname;
    const route = find(method, path) ??
      errors.NoRouteToPath.throw(method, path, `${paths.routes}${index(path)}`);

    // check guards
    const {guards} = route;
    try {
      guards.map(guard => {
        const result = guard(request);
        if (result === true) {
          return undefined;
        }
        const error = new Error();
        error.result = result;
        error.type = guardError;
        throw error;
      });
    } catch (error) {
      if (error.type === guardError) {
        return (await respond(error.result))(app);
      }
      // rethrow if not guard error
      throw error;
    }

    // route.handler is the last module to be executed
    const handlers = [...modules.route, route.handler]
      .reduceRight((acc, handler) => input => handler(input, acc));

    const layouts = await Promise.all(route.layouts.map(layout =>
      layout(request)));

    return (await respond(await handlers({...request,
      path: dispatch(keymap(route.path?.exec(path).groups,
        key => key.split("$")[0])),
    })))(app, {layouts});
  };
};
