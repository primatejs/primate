import type MaybePromise from "pema/MaybePromise";
import type ResponseLike from "#ResponseLike";

type RouteResponse = MaybePromise<ResponseLike> | void;

export { RouteResponse as default };
