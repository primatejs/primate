import { doubled } from "../common.js";
import errors from "../../errors.js";

const normalize = route => {
  let i = 0;
  // user/ -> user
  // user/{id=number}/{id2=number} -> user/{0}/{1}
  return (route.endsWith("/") ? route.slice(0, -1) : route)
    .replaceAll(/\{(?:\w*)(?:=\w+)?\}?/gu, _ => `{${i++}}`);
};

// index -> ""
const deindex = path => path.endsWith("index") ?
  path.replace("index", "") : path;

export default async (log, directory, load) => {
  const filter = path => /^[^+].*.js$/u.test(path.name);
  const routes = (await load({ log, directory, filter }))
    .map(([path, handler]) => [deindex(path), handler]);

  const double = doubled(routes.map(([route]) => normalize(route)));
  double && errors.DoubleRoute.throw(double);

  return routes;
};
