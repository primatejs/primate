import type RouteFunction from "#RouteFunction";
import type RouteGuard from "#RouteGuard";

type RouteSpecial = {
  default: RouteFunction | RouteGuard;
  recursive?: boolean,
}

export { RouteSpecial as default };
