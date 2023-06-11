import {tryreturn} from "runtime-compat/flow";
import errors from "../errors.js";
import {invalid} from "../hooks/route.js";
import {default as fs, doubled} from "./common.js";
import * as get from "./routes/exports.js";

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

export default async (log, directory, load = fs) => {
  const routes = await get.routes(log, directory, load);
  const guards = await get.guards(log, directory, load);
  const layouts = await get.layouts(log, directory, load);
  const filter = path => ([name]) => path.includes(name);

  return routes.map(([path, imported]) => {
    if (imported === undefined || Object.keys(imported).length === 0) {
      errors.EmptyRouteFile.warn(log, directory.join(`${path}.js`).path);
      return [];
    }

    return Object.entries(imported).map(([method, handler]) => ({
      method,
      handler,
      pathname: make(path.endsWith("/") ? path.slice(0, -1) : path),
      guards: guards.filter(filter(path)).map(([, guard]) => guard),
      layouts: layouts.filter(filter(path)).map(([, layout]) => layout),
    }));
  }).flat();
};
