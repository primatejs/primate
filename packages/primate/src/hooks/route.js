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

export default async app => {
  const routes = [];
  const find = (method, path, fallback = {handler: r => r}) =>
    routes.find(route =>
      ieq(route.method, method) && route.path.test(path)) ?? fallback;

  const router = {
    async route({request, url, app, ...rest}) {
      const {method} = request;
      const {pathname, searchParams} = url;
      const verb = find(method, pathname, {handler: () => {
        throw new Logger.Warn(`no ${method} route to ${pathname}`);
      }});

      const data = {
        request,
        url,
        path: verb.path?.exec(pathname)?.groups ?? Object.create(null),
        query: fromNull(Object.fromEntries(searchParams)),
        ...rest,
      };

      return verb.handler(await find("map", pathname).handler(data));
    },
  };
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
  for (const route of await Path.collect(app.paths.routes, /^.*.js$/u)) {
    const imported = (await import(route)).default;
    const file = `${route}`.replace(app.paths.routes, "").slice(1);
    if (imported === undefined) {
      app.log.warn(`empty route file at ${file}`);
    } else {
      const valids = Object.entries(imported)
        .filter(([verb]) => verbs.includes(verb));
      for (const [method, handler] of valids) {
        routes.push({method, path: toRoute(file), handler});
      }
    }
  }
  return router;
};
