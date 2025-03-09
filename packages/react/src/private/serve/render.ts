import type Props from "@primate/core/frontend/Props";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

export default (component: any, props: Props) => {
  const heads: string[] = [];
  const push_heads = (sub_heads: string[]) => {
    heads.push(...sub_heads);
  };
  const body = renderToString(createElement(component, { ...props, push_heads }));
  if (heads.filter(head => head.startsWith("<title")).length > 1) {
    const error = "May only contain one <title> across component hierarchy";
    throw new Error(error);
  }
  const head = heads.join("\n");

  return { body, head };
};
