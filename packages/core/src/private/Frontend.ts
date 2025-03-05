import type Props from "#frontend/Props";
import type { RequestFacade, ResponseLike } from "#serve";
import type { ServeApp } from "#serve/app";
import type Dictionary from "@rcompat/record/Dictionary";

type Frontend = (name: string, props: Props, options: ResponseInit)
  => (app: ServeApp, transfer?: Dictionary, request?: RequestFacade)
    => ResponseLike;

export { Frontend as default };
