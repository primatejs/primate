import { tryreturn } from "rcompat/sync";
import { from } from "rcompat/object";
import { default as fs, doubled } from "./common.js";
import * as get from "./routes/exports.js";
import errors from "../errors.js";
import { invalid } from "../hooks/route.js";

const make = path => {
  const double = doubled(path.split("/")
    .filter(part => part.startsWith("{") && part.endsWith("}"))
    .map(part => part.slice(1, part.indexOf("="))));
  double && errors.DoublePathParameter.throw(double, path);

  const route = path.replaceAll(/\{(?<named>.*?)\}/gu, (_, named) =>
    tryreturn(_ => {
      const { name, type } = /^(?<name>\w+)(?<type>=\w+)?$/u.exec(named).groups;
      const param = type === undefined ? name : `${name}$${type.slice(1)}`;
      return `(?<${param}>[^/]{1,}?)`;
    }).orelse(_ => errors.InvalidPathParameter.throw(named, path)));

  invalid(route) && errors.InvalidRouteName.throw(path);

  return new RegExp(`^/${route}$`, "u");
};

export default async (app, load = fs) => {
  const { log } = app;
  const directory = app.runpath(app.config.location.routes);
  const filter = path => ([name]) => path.includes(name);
  const routes = from(await Promise.all(["guards", "errors", "layouts"]
    .map(async extra => [extra, await get[extra](log, directory, load)])));

  return (await get.routes(log, directory, load)).map(([path, imported]) => {
    if (imported === undefined || Object.keys(imported).length === 0) {
      errors.EmptyRouteFile.warn(log, directory.join(`${path}.js`).path);
      return [];
    }
    const filtered = filter(path);

    return Object.entries(imported).map(([method, handler]) => ({
      method,
      handler,
      pathname: make(path.endsWith("/") ? path.slice(0, -1) : path),
      guards: routes.guards.filter(filtered).map(([, guard]) => guard),
      errors: routes.errors.filter(filtered).map(([, error]) => error),
      layouts: routes.layouts.filter(filtered).map(([, layout]) => layout),
    }));
  }).flat();
};
