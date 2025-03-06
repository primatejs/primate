import type BodyInit from "#BodyInit";
import type { ServeApp } from "#serve/app";
import type MaybePromise from "pema/MaybePromise";

export default <T>(mime: string, mapper: (input: T) => BodyInit[0]) =>
  (body: T, options?: ResponseInit): (app: ServeApp) => MaybePromise<Response> =>
    (app => app.respond(mapper(body), app.media(mime, options)));
