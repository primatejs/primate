import { tryreturn } from "rcompat/sync";
import FS from "rcompat/fs";
import o from "rcompat/object";
import { default as fs, doubled } from "./common.js";
import * as get from "./routes/exports.js";
import errors from "../errors.js";

const { separator } = FS.File;

const valid_route = /^[\w\-[\]=/.]*$/u;

const make = path => {
  !valid_route.test(FS.File.webpath(path)) && errors.InvalidPath.throw(path);

  const double = doubled(path.split(separator)
    .filter(part => part.startsWith("[") && part.endsWith("]"))
    .map(part => part.slice(1, part.indexOf("="))));
  double && errors.DoublePathParameter.throw(double, path);

  const route = path.replaceAll(/\[(?<named>.*?)\]/gu, (_, named) =>
    tryreturn(_ => {
      const { name, type } = /^(?<name>\w+)(?<type>=\w+)?$/u.exec(named).groups;
      const param = type === undefined ? name : `${name}$${type.slice(1)}`;
      return `(?<${param}>[^/]{1,}?)`;
    }).orelse(_ => errors.EmptyPathParameter.throw(named, path)));

  // normalize
  return new RegExp(`^/${FS.File.webpath(route)}$`, "u");
};

export default async (app, load = fs) => {
  const { log } = app;
  const directory = app.runpath(app.get("location.routes"));
  const filter = path => ([name]) => path.includes(name);
  const routes = o.from(await Promise.all(["guards", "errors", "layouts"]
    .map(async extra => [extra, await get[extra](log, directory, load)])));

  return (await get.routes(log, directory, load)).map(([path, imported]) => {
    const route = imported.default;
    if (route === undefined || Object.keys(route).length === 0) {
      errors.EmptyRouteFile.warn(log, directory.join(`${path}.js`).path);
      return [];
    }
    const filtered = filter(path);

    return Object.entries(route).map(([method, handler]) => ({
      method,
      handler,
      pathname: make(path.endsWith(separator) ? path.slice(0, -1) : path),
      guards: routes.guards.filter(filtered).map(([, guard]) => guard.default),
      errors: routes.errors.filter(filtered).map(([, error]) => error.default),
      layouts: routes.layouts.filter(filtered).map(([, layout]) => layout),
      body: imported.body?.parse ?? app.get("request.body.parse"),
    }));
  }).flat();
};
