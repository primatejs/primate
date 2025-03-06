import type RequestFacade from "#RequestFacade";
import type { ServeApp } from "#serve/app";
import type Dictionary from "@rcompat/record/Dictionary";

type ResponseFunction = (app: ServeApp, transfer: Dictionary, request: RequestFacade)
  => Response | Promise<Response> | undefined;

export { ResponseFunction as default };
