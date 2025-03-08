import type Options from "#frontend/Options";
import type Props from "#frontend/Props";
import type RequestFacade from "#RequestFacade";
import type ResponseLike from "#ResponseLike";
import type { ServeApp } from "#serve/app";
import type Dictionary from "@rcompat/record/Dictionary";

type Frontend = (name: string, props: Props, options: Options)
  => (app: ServeApp, transfer: Dictionary, request: RequestFacade)
    => ResponseLike;

export { Frontend as default };
