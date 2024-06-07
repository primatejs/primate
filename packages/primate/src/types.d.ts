export type App = any;

export interface MinOptions {
  status: number;
  headers: Headers | {};
}
  
export interface ErrorOptions extends MinOptions {
  page: string;
}

export interface Options extends ErrorOptions {
  placeholders: {};
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

type ResponseFn = (app: App, ...rest: any[]) => Response;

type ResponseFacade = 
  string 
| object
| URL
| Blob
| ReadableStream
| Response
| ResponseFn;

export type RouteFunction = (request?: RequestFacade) => ResponseFacade;

type Streamable = ReadableStream | Blob;

export type Route = {
  get?: RouteFunction,
  post?: RouteFunction,
  put?: RouteFunction,
  delete?: RouteFunction,
};
