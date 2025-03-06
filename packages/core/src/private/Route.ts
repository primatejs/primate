import type RouteFunction from "#RouteFunction";

type Route = {
  body?: {
    parse?: boolean
  },
  default: {
    get: RouteFunction,
    post: RouteFunction,
    put: RouteFunction,
    delete: RouteFunction,
  }
}

export { Route as default };
