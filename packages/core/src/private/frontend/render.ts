import type Props from "#frontend/Props";
import type ServerComponent from "#ServerComponent";

export default (component: ServerComponent, props: Props) => component(props);
