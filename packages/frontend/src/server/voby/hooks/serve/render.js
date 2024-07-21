import "linkedom-global";
import { createElement, renderToString } from "voby";

export default async (component, props) =>
  renderToString(createElement(component, props));
