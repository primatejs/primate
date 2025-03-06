import type Props from "#frontend/Props";
import type MaybePromise from "pema/MaybePromise";
import type ServerComponent from "./ServerComponent.js";

export type Render = (component: any, props: Props) => MaybePromise<string>;

export default ((component, props) => (component as ServerComponent)(props)) as Render;
