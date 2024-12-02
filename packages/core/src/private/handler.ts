import type { RuntimeApp } from "../serve/app.js";
import type { MaybePromise } from "pema/MaybePromise";
import type { Response as _Response, BodyInit } from "undici-types";

export type Props = Record<string, unknown>;
export type Options = ResponseInit;

export type RenderFn = (app: RuntimeApp) => MaybePromise<Response> | void;
export type Handler = (name: string, props: Props, options: Options) =>
  RenderFn;

export default <T>(mime: string, mapper: (input: T) => BodyInit) =>
  (body: T, options?: Options): RenderFn =>
    (app => app.respond(mapper(body), app.media(mime, options)));
