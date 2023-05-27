import errors from "../errors.js";
import {invalid} from "../hooks/route.js";
import {default as load, doubled} from "./common.js";

const normalize = route => {
  let i = 0;
  return route.replaceAll(/\{(?:\w*)(?:=\w+)?\}?/gu, () => `{${i++}}`);
};

const make = path => {
  const double = doubled(path.split("/")
    .filter(part => part.startsWith("{") && part.endsWith("}"))
    .map(part => part.slice(1, part.indexOf("="))));
  double && errors.DoublePathParameter.throw(double, path);

  const route = path.replaceAll(/\{(?<named>.*?)\}/gu, (_, named) => {
    try {
      const {name, type} = /^(?<name>\w+)(?<type>=\w+)?$/u.exec(named).groups;
      const param = type === undefined ? name : `${name}$${type.slice(1)}`;
      return `(?<${param}>[^/]{1,}?)`;
    } catch (error) {
      return errors.InvalidPathParameter.throw(named, path);
    }
  });

  invalid(route) && errors.InvalidRouteName.throw(path);

  return new RegExp(`^/${route}$`, "u");
};

// transform /index -> "", index -> ""
const deindex = path => path.replace("/index", "").replace("index", "");

export default async (log, directory) => {
  const routes = (await load({log, directory, name: "routes"}))
    .map(([path, handler]) => [deindex(path), handler]);

  const double = doubled(routes.map(([route]) => normalize(route)));
  double && errors.DoubleRoute.throw(double);

  return routes
    .map(([route, imported]) => {
      if (imported === undefined || Object.keys(imported).length === 0) {
        errors.EmptyRouteFile.warn(log, directory.join(`${route}.js`).path);
        return [];
      }

      return Object.entries(imported)
        .map(([method, handler]) => ({method, handler, path: make(route)}));
    }).flat();
};
