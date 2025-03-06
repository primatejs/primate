import type RequestFacade from "#RequestFacade";
import type RouteResponse from "#RouteResponse";

type RouteGuard = (request: RequestFacade) => RouteResponse | true;

export { RouteGuard as default };
