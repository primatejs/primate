import { renderToString, createElement } from "voby";

export default async (component, props) =>
  renderToString(createElement(component, props));
