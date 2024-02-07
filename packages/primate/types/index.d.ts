declare module "primate" {
  type App = any;

  interface MinOptions {
    status: number,
    headers: Headers | {},
  }
  
  interface ErrorOptions extends MinOptions {
    page: string,
  }

  interface Options extends ErrorOptions {
    placeholders: {},
  }

  type Dispatcher = {
    get(property: string): string,
  };

  type RequestFacade = {
    body: {}
    path: Dispatcher,
    query: Dispatcher,
    cookies: Dispatcher,
    headers: Dispatcher,
    original: Request,
  };

  type ResponseFn = (app: App, ...rest: any) => Response;
  type ResponseFacade = 
    string 
  | object
  | URL
  | Blob
  | ReadableStream
  | Response
  | ResponseFn;

  type RouteFunction = (request?: RequestFacade) => ResponseFacade;

  type Streamable = ReadableStream | Blob;

  export type Route = {
    get?: RouteFunction,
    post?: RouteFunction,
    put?: RouteFunction,
    delete?: RouteFunction,
  };

  export function text(body: string, options?: MinOptions): ResponseFn;

  export function json(body: {}, options?: MinOptions): ResponseFn;

  export function stream(body: Streamable, options?: MinOptions): ResponseFn;

  export function redirect(location: string, options?: MinOptions): ResponseFn;

  export function html(name: string, options?: MinOptions): ResponseFn;

  export function view(name: string, props: {}, options?: Options): ResponseFn;

  export function error(body: string, options?: ErrorOptions): ResponseFn;

  export function sse(implementation: {
    open?: () => void,
    close?: () => void,
  }, options?: MinOptions): ResponseFn;
}
