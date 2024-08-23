type RouteFunction = (request?: RequestFacade) => ResponseFacade;

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

type Streamable = ReadableStream | Blob;

declare module "primate" {
  export type Route = {
    get?: RouteFunction,
    post?: RouteFunction,
    put?: RouteFunction,
    delete?: RouteFunction,
  };
}

declare module "primate/handler/error" {
  export default function(body: string, options?: ErrorOptions): ResponseFn;
}

declare module "primate/handler/json" {
  export default function(body: {}, options?: MinOptions): ResponseFn;
}

declare module "primate/handler/redirect" {
  export default function(location: string, options?: MinOptions): ResponseFn;
}

declare module "primate/handler/sse" {
  export default function(implementation: {
    open?: () => void,
    close?: () => void,
  }, options?: MinOptions): ResponseFn;
}

declare module "primate/handler/stream" {
  export default function(body: Streamable, options?: MinOptions): ResponseFn;
}

declare module "primate/handler/text" {
  export default function(body: string, options?: MinOptions): ResponseFn;
}

declare module "primate/handler/view" {
  export default function(name: string, props: {}, options?: Options): ResponseFn;
}

declare module "primate/handler/ws" {
  export default function(implementation: {
    open?: () => void,
    close?: () => void,
    message?: (Event: unknown) => void,
  });
}
