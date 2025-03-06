import type RequestFacade from "#RequestFacade";
import type RouteResponse from "#RouteResponse";

export type RouteFunction = (request: RequestFacade) => RouteResponse;

export { RouteFunction as default };
