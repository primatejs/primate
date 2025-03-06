import type Props from "#frontend/Props";
import type ServerComponent from "#frontend/ServerComponent";

export default (component: ServerComponent, props: Props) => component(props);
