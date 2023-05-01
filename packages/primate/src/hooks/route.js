import {default as Logger, abort} from "../Logger.js";

// insensitive-case equal
const ieq = (left, right) => left.toLowerCase() === right.toLowerCase();
// HTTP verbs
const verbs = [
  // CRUD
  "post", "get", "put", "delete",
  // extended
  "connect", "options", "trace", "patch",
];

const toRoute = file => {
  const route = file
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
        abort(`invalid parameter "${named}"`);
      }
    })
  ;
  try {
    return new RegExp(`^/${route}$`, "u");
  } catch (error) {
    abort("same parameter twice");
  }
};

const reentry = (object, mapper) =>
  Object.fromEntries(mapper(Object.entries(object ?? {})));

export default app => {
  const {types = {}} = app;
  Object.entries(types).every(([name]) => /^(?:\w*)$/u.test(name) ||
    abort(`invalid type "${name}"`));
  const routes = app.routes
    .map(([route, imported]) => {
      if (imported === undefined) {
        app.log.warn(`empty route file at ${route}.js`);
        return [];
      }

      const path = toRoute(route);
      return Object.entries(imported)
        .filter(([verb]) => verbs.includes(verb))
        .map(([method, handler]) => ({method, handler, path}));
    }).flat();
  const paths = routes.map(({method, path}) => `${method}${path}`);
  if (new Set(paths).size !== paths.length) {
    abort("same route twice");
  }

  const isType = groups => Object
    .entries(groups ?? {})
    .map(([name, value]) =>
      [types[name] === undefined ? name : `${name}$${name}`, value])
    .filter(([name]) => name.includes("$"))
    .map(([name, value]) => [name.split("$")[1], value])
    .every(([name, value]) => types?.[name](value) === true)
  ;
  const isPath = ({route, path}) => {
    const result = route.path.exec(path);
    return result === null ? false : isType(result.groups);
  };
  const isMethod = ({route, method, path}) => ieq(route.method, method)
    && isPath({route, path});
  const find = (method, path) => routes.find(route =>
    isMethod({route, method, path}));

  return request => {
    const {original: {method}, url: {pathname}} = request;
    const verb = find(method, pathname) ?? (() => {
      throw new Logger.Warn(`no ${method} route to ${pathname}`);
    })();
    const path = reentry(verb.path?.exec(pathname).groups,
      object => object.map(([key, value]) => [key.split("$")[0], value]));

    return verb.handler({...request, path});
  };
};
