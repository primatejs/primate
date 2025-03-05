import double_route from "#error/double-route";
import optional_route from "#error/optional-route";
import rest_route from "#error/rest-route";
import type FileRef from "@rcompat/fs/FileRef";
import Router from "@rcompat/fs/router";

const error_entries = Object.entries({
  DoubleRoute: double_route,
  OptionalRoute: optional_route,
  RestRoute: rest_route,
});

export default async (directory: FileRef, extensions: string[]): ReturnType<typeof Router.load> => {
  try {
    return await Router.load({
        import: false,
        extensions: [extensions[0]],
        directory: directory.toString(),
        specials: {
          guard: { recursive: true },
          error: { recursive: false },
          layout: { recursive: true },
        },
        predicate(route, request) {
          return (route.default as Record<string, unknown>)[request.method.toLowerCase()] !== undefined;
        },
      });
  } catch (error) {
    error_entries.forEach(([key, value]) =>
      key in Router.Error && value((error as { route: string }).route)
    );
    // rethrow original error
    throw error;
  }
};
