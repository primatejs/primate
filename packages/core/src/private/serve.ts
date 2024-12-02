import Dictionary from "@rcompat/record/Dictionary";
import type { MaybePromise } from "pema/MaybePromise";
import type { App } from "../serve/app.js";
import BodyInit from "#BodyInit";

export interface RequestFacade {
  request: Request;
  url: URL;
  query: Dictionary;
  headers: Headers;
  cookies: Dictionary;
  path: Dictionary;
  pass(to: string): Promise<Response>,
}

export type ResponseFunction = (app: App, transfer: Dictionary, request: RequestFacade)
  => Response | Promise<Response> | undefined;

export type ResponseLike = 
  string |
  URL |
  ReadableStream |
  Blob |
  Response |
  ResponseFunction |
  /*throws*/void;

type RouteResponse = MaybePromise<ResponseLike> | void;

export type Frontend = (name: string, Props: Dictionary, Options: ResponseInit)
  => (app: App, transfer: Dictionary, request: RequestFacade)
    => ResponseLike;

export type { App };

const handler = <T>(mime: string, mapper: (input: T) => BodyInit[0]) =>
  (body: T, options?: ResponseInit): (app: App) => MaybePromise<Response> =>
    (app => app.respond(mapper(body), app.media(mime, options)));

export { handler };

export type RouteFunction = (request: RequestFacade) => RouteResponse;

export type Route = {
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

export type RouteSpecial = {
  default: RouteFunction | RouteGuard;
  recursive?: boolean,
}

export type RouteGuard = (request: RequestFacade) => RouteResponse | true;
