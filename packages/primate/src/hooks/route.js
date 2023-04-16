import {Path} from "runtime-compat/fs";
import {Logger} from "primate";
import fromNull from "../fromNull.js";

// insensitive-case equal
const ieq = (left, right) => left.toLowerCase() === right.toLowerCase();
// HTTP verbs
const verbs = [
  // CRUD
  "post", "get", "put", "delete",
  // extended
  "delete", "connect", "options", "trace", "patch",
];

const toRoute = file => {
  const ending = -3;
  const route = file
    // remove ending
    .slice(0, ending)
    // transform /index -> ""
    .replace("/index", "")
    // transform index -> ""
    .replace("index", "")
    // prepare for regex
    .replaceAll(/\{(?<named>.*)\}/gu, (_, name) => `(?<${name}>.*?)`)
  ;
  return new RegExp(`^/${route}$`, "u");
};

export default async app => {
  const routes = (await Promise.all(
    (await Path.collect(app.paths.routes, /^.*.js$/u))
      .map(async route => {
        const imported = (await import(route)).default;
        const file = `${route}`.replace(app.paths.routes, "").slice(1);
        if (imported === undefined) {
          app.log.warn(`empty route file at ${file}`);
          return [];
        }

        const path = toRoute(file);
        return Object.entries(imported)
          .filter(([verb]) => verbs.includes(verb))
          .map(([method, handler]) => ({method, handler, path}));
      }))).flat();
  const find = (method, path) => routes.find(route =>
    ieq(route.method, method) && route.path.test(path));

  const router = {
    async route({request, url, ...rest}) {
      const {method} = request;
      const {pathname, searchParams} = url;
      const verb = find(method, pathname) ?? (() => {
        throw new Logger.Warn(`no ${method} route to ${pathname}`);
      })();

      const data = {
        request,
        url,
        path: verb.path?.exec(pathname)?.groups ?? Object.create(null),
        query: fromNull(Object.fromEntries(searchParams)),
        ...rest,
      };

      return verb.handler(data);
    },
  };
  return router;
};
