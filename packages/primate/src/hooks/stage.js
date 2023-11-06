import { cascade } from "rcompat/async";
import dispatch from "../dispatch.js";
import * as loaders from "../loaders/exports.js";
import { doubled } from "../loaders/common.js";
import errors from "../errors.js";

const pre = async app => {
  const { config: { location } } = app;

  // remove build directory in case exists
  await app.path.build.remove();

  // stage routes
  await app.runpath(location.routes).create();
  const double = doubled((await app.path.routes.collect())
    .map(path => path.debase(app.path.routes))
    .map(path => `${path}`.slice(1, -path.extension.length - 1)));
  double && errors.DoubleRoute.throw(double);

  await app.stage(app.path.routes, location.routes);
  if (await app.path.types.exists()) {
    await app.stage(app.path.types, location.types);
  }
  const staged = app.runpath(location.routes);
  await Promise.all((await staged.collect()).map(path =>
    app.extensions[path.extension]?.route(staged, path.debase(`${staged}/`))));

  return app;
};

const post = async app => {
  const { config: { location } } = app;

  const routes = await loaders.routes(app);
  const types = await loaders.types(app.log, app.runpath(location.types));

  return {
    ...app,
    routes,
    types,
    dispatch: dispatch(types),
    layout: {
      depth: Math.max(...routes.map(({ layouts }) => layouts.length)) + 1,
    },
  };
};

export default async app =>
  post(await (await cascade(app.modules.stage))(await pre(app)));
