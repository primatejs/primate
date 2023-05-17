import errors from "../errors.js";

const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

// insensitive-case equal
const ieq = (left, right) => left.toLowerCase() === right.toLowerCase();

/* routes may not contain dots */
export const invalid = route => /\./u.test(route);
const toRoute = path => {
  const double = path.split("/")
    .filter(part => part.startsWith("{") && part.endsWith("}"))
    .map(part => part.slice(1, part.indexOf(":")))
    .find((part, i, array) =>
      array.filter((_, j) => i !== j).includes(part));
  double && errors.DoublePathParameter.throw({path, double});

  const route = path
    // transform /index -> ""
    .replace("/index", "")
    // transform index -> ""
    .replace("index", "")
    // prepare for regex
    .replaceAll(/\{(?<named>.*?)\}/gu, (_, named) => {
      try {
        const {name, type} = /^(?<name>\w*)(?<type>:\w+)?$/u.exec(named).groups;
        const param = type === undefined ? name : `${name}$${type.slice(1)}`;
        return `(?<${param}>[^/]{1,}?)`;
      } catch (error) {
        return errors.InvalidPathParameter.throw({named, path});
      }
    });

  invalid(route) && errors.InvalidRouteName.throw({path});

  return new RegExp(`^/${route}$`, "u");
};

const reentry = (object, mapper) =>
  Object.fromEntries(mapper(Object.entries(object ?? {})));

export default app => {
  const double = app.routes
    .map(([route]) => route
      .replaceAll("/index", "")
      .replaceAll(/\{(?<name>\w*)(?<_>:\w+)?\}?/gu, (_, name) => `{${name}}`))
    .find((part, i, array) =>
      array.filter((_, j) => i !== j).includes(part));

  double && errors.DoubleRoute.throw({double});

  const routes = app.routes
    .map(([route, imported]) => {
      if (imported === undefined || Object.keys(imported).length === 0) {
        errors.EmptyRouteFile.warn(app.log, {config: app.config, route});
        return [];
      }

      return Object.entries(imported)
        .map(([method, handler]) => ({method, handler, path: toRoute(route)}));
    }).flat();

  const {types = {}} = app;
  Object.entries(types).some(([name]) => /^(?:[^\W_]*)$/u.test(name) ||
    errors.InvalidTypeName.throw({name}));
  const reserved = ["get", "raw"];
  Object.entries(types).some(([name]) => reserved.includes(name) &&
    errors.ReservedTypeName.throw({name}));

  const {explicit} = app.config.types;
  const isType = (groups, path) => Object
    .entries(groups ?? {})
    .map(([name, value]) =>
      [types[name] === undefined || explicit ? name : `${name}$${name}`, value])
    .filter(([name]) => name.includes("$"))
    .map(([name, value]) => [name.split("$")[1], value])
    .every(([name, value]) => {
      try {
        return types?.[name](value) === true;
      } catch (error) {
        return errors.MismatchedPath.throw({message: error.message, path});
      }
    });
  const isPath = ({route, path}) => {
    const result = route.path.exec(path);
    return result === null ? false : isType(result.groups, path);
  };
  const isMethod = ({route, method, path}) => ieq(route.method, method)
    && isPath({route, path});
  const find = (method, path) => routes.find(route =>
    isMethod({route, method, path}));
  const modules = filter("route", app.modules);

  return request => {
    const {original: {method}, url: {pathname}} = request;
    const verb = find(method, pathname) ??
      errors.NoRouteToPath.throw({method, pathname, config: app.config});
    const path = app.dispatch(reentry(verb.path?.exec(pathname).groups,
      object => object.map(([key, value]) => [key.split("$")[0], value])));

    // verb.handler is the last module to be executed
    const handlers = [...modules, verb.handler].reduceRight((acc, handler) =>
      input => handler(input, acc));

    return handlers({...request, path});
  };
};
