import type Props from "@primate/core/frontend/Props"
import type { Renderable } from "marko/src/runtime/html/Template.js";

export default (component: Renderable, props: Props) => component.renderToString(props);
