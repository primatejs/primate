import * as errors from "@primate/core/errors";
import Router from "@rcompat/fs/router";

export default async directory => {

  try {
    return await Router.load({
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
    const { DoubleRoute, OptionalRoute, RestRoute } = Router.Error;
    error instanceof DoubleRoute && errors.DoubleRoute.throw(error.route);
    error instanceof OptionalRoute && errors.OptionalRoute.throw(error.route);
    error instanceof RestRoute && errors.RestRoute.throw(error.route);
    // rethrow original error
    throw error;
  }
};
