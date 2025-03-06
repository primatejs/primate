import runtime from "handlebars/runtime.js";
import type Props from "@primate/core/frontend/Props";
import type ServerComponent from "@primate/core/frontend/ServerComponent";

export default (component: ServerComponent, props: Props) =>
  (runtime as any).template(component)(props);
