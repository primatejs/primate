import type Props from "#frontend/Props";
import type MaybePromise from "pema/MaybePromise";

type ServerComponent = (props: Props) => MaybePromise<string>;

export { ServerComponent as default };
