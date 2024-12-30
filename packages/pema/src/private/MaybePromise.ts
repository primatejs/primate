import type { Maybe } from "./Maybe.js";

export type MaybePromise<T> = Maybe<Promise<T>>;
