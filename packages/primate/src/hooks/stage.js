import FS from "rcompat/fs";
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
  const $location = app.get("location");

  // stage routes
  if (await app.path.routes.exists()) {
    await app.stage(app.path.routes, $location.routes);
  }
  if (await app.path.types.exists()) {
    await app.stage(app.path.types, $location.types);
  }
  const user_types = await loaders.types(app.log, app.runpath($location.types));
  const types = { ...app.types, ...user_types };

  const directory = app.runpath($location.routes);
  for (const path of await directory.collect()) {
    await app.extensions[path.extension]
      ?.route(directory, path.debase(`${directory}/`), types);
  }

  let router;

  try {
    router = await FS.Router.load({
        directory,
        specials: {
          guard: { recursive: true },
          error: { recursive: false },
          layout: { recursive: true },
        },
        predicate(route, request) {
          return route.default[request.method.toLowerCase()] !== undefined;
        },
      });
  } catch (error) {
    const { DoubleRoute, OptionalRoute, RestRoute } = FS.Router.Error;
    error instanceof DoubleRoute && errors.DoubleRoute.throw(error.route);
    error instanceof OptionalRoute && errors.OptionalRoute.throw(error.route);
    error instanceof RestRoute && errors.RestRoute.throw(error.route);
  }
  const layout = { depth: router.depth("layout") };
  return { ...app, types, dispatch: dispatch(types), layout, router };
};

export default async app =>
  post(await (await cascade(app.modules.stage))(await pre(app)));
