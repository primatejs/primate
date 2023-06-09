import {tryreturn} from "runtime-compat/flow";
import errors from "../errors.js";
import {invalid} from "../hooks/route.js";
import {default as fs, doubled} from "./common.js";

const normalize = route => {
  let i = 0;
  return route.replaceAll(/\{(?:\w*)(?:=\w+)?\}?/gu, _ => `{${i++}}`);
};

const make = path => {
  const double = doubled(path.split("/")
    .filter(part => part.startsWith("{") && part.endsWith("}"))
    .map(part => part.slice(1, part.indexOf("="))));
  double && errors.DoublePathParameter.throw(double, path);

  const route = path.replaceAll(/\{(?<named>.*?)\}/gu, (_, named) =>
    tryreturn(_ => {
      const {name, type} = /^(?<name>\w+)(?<type>=\w+)?$/u.exec(named).groups;
      const param = type === undefined ? name : `${name}$${type.slice(1)}`;
      return `(?<${param}>[^/]{1,}?)`;
    }).orelse(_ => errors.InvalidPathParameter.throw(named, path)));

  invalid(route) && errors.InvalidRouteName.throw(path);

  return new RegExp(`^/${route}$`, "u");
};

// transform /index -> "", index -> ""
const deindex = path => path.replace("index", "").replace("index", "");

const routeFilter = path => /^[^+].*.js$/u.test(path.name);
const guardFilter = path => /^\+guard.js$/u.test(path.name);

const name = "routes";

export default async (log, directory, load = fs) => {
  const routes = (await load({log, directory, name, filter: routeFilter}))
    .map(([path, handler]) => [deindex(path), handler]);

  const double = doubled(routes.map(([route]) => normalize(route)));
  double && errors.DoubleRoute.throw(double);

  const guards = (await load({log, directory, name, filter: guardFilter}))
    .map(([name, guard]) => [name.replace(/\+guard/u, () => ""), guard])
    .toSorted(([a], [b]) => a.length - b.length);

  guards.some(([name, guard]) =>
    typeof guard !== "function" && errors.InvalidGuard.throw(name));

  return routes.map(([path, imported]) => {
    if (imported === undefined || Object.keys(imported).length === 0) {
      errors.EmptyRouteFile.warn(log, directory.join(`${path}.js`).path);
      return [];
    }

    return Object.entries(imported).map(([method, handler]) => ({
      method,
      handler,
      path: make(path.endsWith("/") ? path.slice(0, -1) : path),
      guards: guards.filter(([name]) => path.includes(name)).map(([, guard]) => guard),
    }));
  }).flat();
};
