import {Logger} from "primate";
import fromNull from "../fromNull.js";

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
    .replaceAll(/\{(?<named>.*)\}/gu, (_, name) => `(?<${name}>[^/]{1,}?)`)
  ;
  return new RegExp(`^/${route}$`, "u");
};

export default app => {
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

  const find = (method, path) => routes.find(route =>
    ieq(route.method, method) && route.path.test(path));

  return request => {
    const {original: {method}, url: {pathname}} = request;
    const verb = find(method, pathname) ?? (() => {
      throw new Logger.Warn(`no ${method} route to ${pathname}`);
    })();

    return verb.handler({
      ...request,
      path: verb.path?.exec(pathname)?.groups ?? Object.create(null),
    });
  };
};
