import { cascade } from "rcompat/async";
import dispatch from "../dispatch.js";
import * as loaders from "../loaders/exports.js";
import { doubled } from "../loaders/common.js";
import errors from "../errors.js";

const pre = async app => {
  // remove build directory in case exists
  await app.path.build.remove();
  await app.path.build.create();
  await Promise.all(["server", "client", "pages", "components"]
    .map(directory => app.runpath(directory).create()));

  return { ...app };
};

const post = async app => {
  const { config: { location } } = app;

  // stage routes
  await app.runpath(location.routes).create();
  const double = doubled((await app.path.routes.collect())
    .map(path => path.debase(app.path.routes))
    .map(path => `${path}`.slice(1, -path.extension.length)));
  double && errors.DoubleRoute.throw(double);

  await app.stage(app.path.routes, location.routes);
  if (await app.path.types.exists()) {
    await app.stage(app.path.types, location.types);
  }
  const user_types = await loaders.types(app.log, app.runpath(location.types));
  const types = { ...app.types, ...user_types };

  const staged = app.runpath(location.routes);
  for (const path of await staged.collect()) {
    await app.extensions[path.extension]
      ?.route(staged, path.debase(`${staged}/`), types);
  }
  const routes = await loaders.routes(app);
  const layout = {
    depth: Math.max(...routes.map(({ layouts }) => layouts.length)) + 1,
  };

  return { ...app, types, routes, dispatch: dispatch(types), layout };
};

export default async app =>
  post(await (await cascade(app.modules.stage))(await pre(app)));
