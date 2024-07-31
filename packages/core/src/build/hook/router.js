import double_route from "#error/double-route";
import optional_route from "#error/optional-route";
import rest_route from "#error/rest-route";
import Router from "@rcompat/fs/router";

const error_entries = Object.entries({
  DoubleRoute: double_route,
  OptionalRoute: optional_route,
  RestRoute: rest_route,
});

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
    error_entries.forEach(([key, value]) =>
      error instanceof Router.Error[key] && value(error.route));
    // rethrow original error
    throw error;
  }
};
